import prisma from '../../prisma/client.js';
import { body } from 'express-validator';
import { handleValidationErrors, validateUsername } from '../middleware/validation.js';

const validateUserUpdate = [
  body('displayName').optional().isLength({ min: 1, max: 100 }).withMessage('Display name must be between 1 and 100 characters'),
  body('avatarUrl').optional().isString().isLength({ max: 255 }).withMessage('Avatar URL must be a string up to 255 characters'),
  body('showStatus').optional().isBoolean().withMessage('Show status must be a boolean'),
  body('allowInvites').optional().isBoolean().withMessage('Allow invites must be a boolean'),
  body('searchable').optional().isBoolean().withMessage('Searchable must be a boolean')
];

export const getUserByUsername = [
  ...validateUsername,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { username } = req.params;

      const user = await prisma.user.findUnique({
        where: { username: username },
        select: {
          username: true,
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

export const updateUser = [
  ...validateUserUpdate,
  handleValidationErrors,
  async (req, res) => {
    const { username } = req.params;
    const { displayName, avatarUrl, showStatus, allowInvites, searchable } = req.body;
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (showStatus !== undefined) updateData.showStatus = showStatus;
    if (allowInvites !== undefined) updateData.allowInvites = allowInvites;
    if (searchable !== undefined) updateData.searchable = searchable;

    try {
      const updatedUser = await prisma.user.update({
        where: { username },
        data: updateData
      });

      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: 'Error while updating user', error: error.message });
    }
  }
];
