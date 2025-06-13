import prisma from '../../prisma/client.js';
import { body, param, validationResult } from 'express-validator';

// Validation middleware
const validateContactId = [param('id').isInt({ min: 1 }).withMessage('Contact ID must be a positive integer')];

const validateContactCreate = [
  body('contactId').isInt({ min: 1 }).withMessage('Contact ID must be a positive integer'),
  body('isFavorite').optional().isBoolean().withMessage('isFavorite must be a boolean')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const getContacts = async (req, res) => {
  try {
    const userId = req.user?.id; // Assuming user is added to req by auth middleware

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const contacts = await prisma.contact.findMany({
      where: { ownerId: userId },
      include: {
        contact: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            showStatus: true
          }
        }
      }
    });

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error while fetching contacts', error: error.message });
  }
};

export const addContact = [
  ...validateContactCreate,
  handleValidationErrors,
  async (req, res) => {
    const { contactId, isFavorite = false } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (userId === contactId) {
      return res.status(400).json({ message: 'Cannot add yourself as a contact' });
    }

    try {
      // Check if contact user exists
      const contactUser = await prisma.user.findUnique({
        where: { id: contactId }
      });

      if (!contactUser) {
        return res.status(404).json({ message: 'Contact user not found' });
      }

      // Check if contact already exists
      const existingContact = await prisma.contact.findUnique({
        where: {
          ownerId_contactId: {
            ownerId: userId,
            contactId
          }
        }
      });

      if (existingContact) {
        return res.status(409).json({ message: 'Contact already exists' });
      }

      const contact = await prisma.contact.create({
        data: {
          ownerId: userId,
          contactId,
          isFavorite
        },
        include: {
          contact: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              showStatus: true
            }
          }
        }
      });

      res.status(201).json(contact);
    } catch (error) {
      res.status(500).json({ message: 'Error while adding contact', error: error.message });
    }
  }
];

export const updateContact = [
  ...validateContactId,
  body('isFavorite').optional().isBoolean().withMessage('isFavorite must be a boolean'),
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    const { isFavorite } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
      const contact = await prisma.contact.findFirst({
        where: {
          id: parseInt(id),
          ownerId: userId
        }
      });

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      const updatedContact = await prisma.contact.update({
        where: { id: parseInt(id) },
        data: { isFavorite },
        include: {
          contact: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              showStatus: true
            }
          }
        }
      });

      res.json(updatedContact);
    } catch (error) {
      res.status(500).json({ message: 'Error while updating contact', error: error.message });
    }
  }
];

export const deleteContact = [
  ...validateContactId,
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
      const contact = await prisma.contact.findFirst({
        where: {
          id: parseInt(id),
          ownerId: userId
        }
      });

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      await prisma.contact.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error while deleting contact', error: error.message });
    }
  }
];
