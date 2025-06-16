import prisma from '../../prisma/client.js';
import { body } from 'express-validator';
import { handleValidationErrors, validateUserId, validateUsername } from '../middleware/validation.js';

const validateUserUpdate = [
  body('displayName').optional().isLength({ min: 1, max: 100 }).withMessage('Display name must be between 1 and 100 characters'),
  body('avatarUrl').optional().isString().isLength({ max: 255 }).withMessage('Avatar URL must be a string up to 255 characters'),
  body('showStatus').optional().isBoolean().withMessage('Show status must be a boolean'),
  body('allowInvites').optional().isBoolean().withMessage('Allow invites must be a boolean'),
  body('searchable').optional().isBoolean().withMessage('Searchable must be a boolean')
];

export const getSelf = [
  async (req, res, next) => {
    try {
      res.json({
        id: req.user.id,
        displayName: req.user.displayName,
        avatarUrl: req.user.avatarUrl
      });
    } catch (error) {
      next(error);
    }
  }
];

export const getUserById = [
  ...validateUserId,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: id },
        select: {
          id: true,
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
        const err = new Error('User not found!');
        err.status = 404;
        return next(err);
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
];

export const getUserByUsername = [
  ...validateUsername,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { username } = req.params;

      const user = await prisma.user.findUnique({
        where: { username: username },
        select: {
          id: true,
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
        const err = new Error('User not found!');
        err.status = 404;
        return next(err);
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
];

export const updateUser = [
  ...validateUserUpdate,
  handleValidationErrors,
  async (req, res, next) => {
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
      error.status = 400;
      next(error);
    }
  }
];
