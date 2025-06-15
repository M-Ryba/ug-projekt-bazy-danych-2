import prisma from '../../prisma/client.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const validateBlockId = [param('id').isInt({ min: 1 }).withMessage('Block ID must be a positive integer')];
const validateBlockCreate = [body('blockedId').isInt({ min: 1 }).withMessage('Blocked user ID must be a positive integer')];

export const getBlocks = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

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
    res.status(500).json({ message: 'Error while fetching blocked users', error: error.message });
  }
};

export const blockUser = [
  ...validateBlockCreate,
  handleValidationErrors,
  async (req, res) => {
    const { blockedId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (userId === blockedId) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    try {
      // Check if blocked user exists
      const blockedUser = await prisma.user.findUnique({
        where: { id: blockedId }
      });

      if (!blockedUser) {
        return res.status(404).json({ message: 'User to block not found' });
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
        return res.status(409).json({ message: 'User is already blocked' });
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
      res.status(500).json({ message: 'Error while blocking user', error: error.message });
    }
  }
];

export const unblockUser = [
  ...validateBlockId,
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
      const block = await prisma.block.findFirst({
        where: {
          id: parseInt(id),
          blockerId: userId
        }
      });

      if (!block) {
        return res.status(404).json({ message: 'Block not found' });
      }

      await prisma.block.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: 'User unblocked successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error while unblocking user', error: error.message });
    }
  }
];
