import prisma from '../../prisma/client.js';
import { body, param } from 'express-validator';
import handleValidationErrors from '../middleware/validation.js';

const validateBlockId = [param('id').isInt({ min: 1 }).withMessage('Block ID must be a positive integer')];
const validateBlockCreate = [body('blockedId').isInt({ min: 1 }).withMessage('Blocked user ID must be a positive integer')];

export const getBlocks = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const blocks = await prisma.block.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    res.json(blocks);
  } catch (error) {
    next(error);
  }
};

export const blockUser = [
  ...validateBlockCreate,
  handleValidationErrors,
  async (req, res, next) => {
    const { blockedId } = req.body;
    const userId = req.user?.id;

    if (userId === blockedId) {
      const err = new Error('Cannot block yourself');
      err.status = 400;
      return next(err);
    }

    try {
      // Check if blocked user exists
      const blockedUser = await prisma.user.findUnique({
        where: { id: blockedId }
      });

      if (!blockedUser) {
        const err = new Error('User to block not found');
        err.status = 404;
        return next(err);
      }

      // Check if block already exists
      const existingBlock = await prisma.block.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: userId,
            blockedId
          }
        }
      });

      if (existingBlock) {
        const err = new Error('User is already blocked');
        err.status = 409;
        return next(err);
      }

      const block = await prisma.block.create({
        data: {
          blockerId: userId,
          blockedId
        },
        include: {
          blocked: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true
            }
          }
        }
      });

      // Remove from contacts if exists
      await prisma.contact.deleteMany({
        where: {
          OR: [
            { ownerId: userId, contactId: blockedId },
            { ownerId: blockedId, contactId: userId }
          ]
        }
      });

      res.status(201).json(block);
    } catch (error) {
      next(error);
    }
  }
];

export const unblockUser = [
  ...validateBlockId,
  handleValidationErrors,
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;

    try {
      const block = await prisma.block.findFirst({
        where: {
          id: parseInt(id),
          blockerId: userId
        }
      });

      if (!block) {
        const err = new Error('Block not found');
        err.status = 404;
        return next(err);
      }

      await prisma.block.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: 'User unblocked successfully' });
    } catch (error) {
      next(error);
    }
  }
];
