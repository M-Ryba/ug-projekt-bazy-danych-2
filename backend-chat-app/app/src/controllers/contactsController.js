import prisma from '../../prisma/client.js';
import { body, param } from 'express-validator';
import handleValidationErrors from '../middleware/handleValidationErrors.js';

const validateContactId = [param('id').isInt({ min: 1 }).withMessage('Contact ID must be a positive integer')];

export const getContacts = async (req, res, next) => {
  try {
    const userId = req.user?.id;
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
    next(error);
  }
};

export const addContact = [
  body('contactId').isInt({ min: 1 }).withMessage('Contact ID must be a positive integer'),
  body('isFavorite').optional().isBoolean().withMessage('isFavorite must be a boolean'),
  handleValidationErrors,
  async (req, res, next) => {
    const { contactId, isFavorite = false } = req.body;
    const userId = req.user?.id;
    if (userId === contactId) {
      const err = new Error('Cannot add yourself as a contact');
      err.status = 400;
      return next(err);
    }
    try {
      const existingContact = await prisma.contact.findUnique({
        where: {
          ownerId_contactId: {
            ownerId: userId,
            contactId
          }
        }
      });
      if (existingContact) {
        const err = new Error('Contact already exists');
        err.status = 409;
        return next(err);
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
      next(error);
    }
  }
];

export const updateContact = [
  ...validateContactId,
  body('isFavorite').optional().isBoolean().withMessage('isFavorite must be a boolean'),
  handleValidationErrors,
  async (req, res, next) => {
    const { id } = req.params;
    const { isFavorite } = req.body;
    const userId = req.user?.id;
    try {
      const contact = await prisma.contact.findFirst({
        where: {
          id: parseInt(id),
          ownerId: userId
        }
      });
      if (!contact) {
        const err = new Error('Contact not found');
        err.status = 404;
        return next(err);
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
      next(error);
    }
  }
];

export const deleteContact = [
  ...validateContactId,
  handleValidationErrors,
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
      const contact = await prisma.contact.findFirst({
        where: {
          id: parseInt(id),
          ownerId: userId
        }
      });
      if (!contact) {
        const err = new Error('Contact not found');
        err.status = 404;
        return next(err);
      }
      await prisma.contact.delete({
        where: { id: parseInt(id) }
      });
      res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
];
