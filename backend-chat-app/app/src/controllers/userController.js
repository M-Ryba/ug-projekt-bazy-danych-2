import prisma from '../../prisma/client.js';
import { body, param, validationResult } from 'express-validator';

// Validation middleware
export const validateUserId = [param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer')];

export const validateUserUpdate = [
  body('username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('displayName').optional().isLength({ min: 1, max: 100 }).withMessage('Display name must be between 1 and 100 characters'),
  body('avatarUrl').optional().isURL().withMessage('Avatar URL must be a valid URL'),
  body('showStatus').optional().isBoolean().withMessage('Show status must be a boolean'),
  body('allowInvites').optional().isBoolean().withMessage('Allow invites must be a boolean')
];

export const validateUserCreate = [
  body('username').notEmpty().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('displayName').notEmpty().isLength({ min: 1, max: 100 }).withMessage('Display name must be between 1 and 100 characters'),
  body('avatarUrl').optional().isURL().withMessage('Avatar URL must be a valid URL')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const getUserById = [
  ...validateUserId,
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          emailVerified: true,
          showStatus: true,
          allowInvites: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found!' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error: ', error: error.message });
    }
  }
];

export const createUser = [
  ...validateUserCreate,
  handleValidationErrors,
  async (req, res) => {
    const { username, email, displayName, avatarUrl } = req.body;

    try {
      const user = await prisma.user.create({
        data: {
          username,
          email,
          displayName,
          avatarUrl
        }
      });

      res.status(201).json(user);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Username or email already exists' });
      }
      res.status(500).json({ message: 'Error while creating user', error: error.message });
    }
  }
];

export const updateUser = [
  ...validateUserId,
  ...validateUserUpdate,
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    const { username, email, displayName, avatarUrl, showStatus, allowInvites } = req.body;

    if (!username && !email && !displayName && avatarUrl === undefined && showStatus === undefined && allowInvites === undefined) {
      return res.status(400).json({ message: 'At least one field to update is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found!' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          ...(username && { username }),
          ...(email && { email }),
          ...(displayName && { displayName }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(showStatus !== undefined && { showStatus }),
          ...(allowInvites !== undefined && { allowInvites })
        }
      });

      res.json(updatedUser);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Username or email already in use' });
      }
      res.status(500).json({ message: 'Error while updating user', error: error.message });
    }
  }
];

export const deleteUser = [
  ...validateUserId,
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found!' });
      }

      await prisma.user.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error while deleting user', error: error.message });
    }
  }
];
