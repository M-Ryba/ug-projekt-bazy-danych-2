import prisma from '../../prisma/client.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const validateChatId = [param('id').isInt({ min: 1 }).withMessage('Chat ID must be a positive integer')];

const validateChatCreate = [
  body('type').isIn(['PRIVATE', 'GROUP']).withMessage('Type must be either PRIVATE or GROUP'),
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('memberIds').isArray({ min: 1 }).withMessage('Member IDs must be an array with at least one member'),
  body('memberIds.*').isInt({ min: 1 }).withMessage('Each member ID must be a positive integer')
];

const validateChatUpdate = [
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters')
];

const validateMemberAdd = [
  body('userIds').isArray({ min: 1 }).withMessage('User IDs must be an array with at least one user'),
  body('userIds.*').isInt({ min: 1 }).withMessage('Each user ID must be a positive integer')
];

export const getChats = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true
              }
            }
          }
        },
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(chats);
  } catch (error) {
    next(error);
  }
};

export const getChatById = [
  ...validateChatId,
  handleValidationErrors,
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;

    try {
      const chat = await prisma.chat.findFirst({
        where: {
          id: parseInt(id),
          members: {
            some: { userId }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true
                }
              }
            }
          },
          owner: {
            select: {
              id: true,
              username: true,
              displayName: true
            }
          }
        }
      });

      if (!chat) {
        const err = new Error('Chat not found or insufficient permissions');
        err.status = 404;
        return next(err);
      }

      res.json(chat);
    } catch (error) {
      next(error);
    }
  }
];

export const createChat = [
  ...validateChatCreate,
  handleValidationErrors,
  async (req, res, next) => {
    const { type, name, description, memberIds } = req.body;
    const userId = req.user?.id;

    if (type === 'PRIVATE' && memberIds.length !== 1) {
      return res.status(400).json({ message: 'Private chat must have exactly one other member' });
    }

    try {
      // Check if all members exist
      const members = await prisma.user.findMany({
        where: { id: { in: memberIds } }
      });

      if (members.length !== memberIds.length) {
        return res.status(400).json({ message: 'Some members do not exist' });
      }

      // For private chats, check if chat already exists
      if (type === 'PRIVATE') {
        const existingChat = await prisma.chat.findFirst({
          where: {
            type: 'PRIVATE',
            members: {
              every: {
                userId: { in: [userId, memberIds[0]] }
              }
            }
          }
        });

        if (existingChat) {
          return res.status(409).json({ message: 'Private chat already exists with this user' });
        }
      }

      const chat = await prisma.chat.create({
        data: {
          type,
          name,
          description,
          ownerId: userId,
          members: {
            create: [{ userId, role: 'ADMIN' }, ...memberIds.map((memberId) => ({ userId: memberId, role: 'MEMBER' }))]
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true
                }
              }
            }
          },
          owner: {
            select: {
              id: true,
              username: true,
              displayName: true
            }
          }
        }
      });

      res.status(201).json(chat);
    } catch (error) {
      next(error);
    }
  }
];

export const updateChat = [
  ...validateChatId,
  ...validateChatUpdate,
  handleValidationErrors,
  async (req, res, next) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.id;

    try {
      const chat = await prisma.chat.findFirst({
        where: {
          id: parseInt(id),
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                  role: 'ADMIN'
                }
              }
            }
          ]
        }
      });

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found or insufficient permissions' });
      }

      const updatedChat = await prisma.chat.update({
        where: { id: parseInt(id) },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description })
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true
                }
              }
            }
          },
          owner: {
            select: {
              id: true,
              username: true,
              displayName: true
            }
          }
        }
      });

      res.json(updatedChat);
    } catch (error) {
      next(error);
    }
  }
];

export const deleteChat = [
  ...validateChatId,
  handleValidationErrors,
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;

    try {
      const chat = await prisma.chat.findFirst({
        where: {
          id: parseInt(id),
          ownerId: userId
        }
      });

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found or insufficient permissions' });
      }

      await prisma.chat.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
];

export const addMembers = [
  ...validateChatId,
  ...validateMemberAdd,
  handleValidationErrors,
  async (req, res, next) => {
    const { id } = req.params;
    const { userIds } = req.body;
    const userId = req.user?.id;

    try {
      const chat = await prisma.chat.findFirst({
        where: {
          id: parseInt(id),
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                  role: 'ADMIN'
                }
              }
            }
          ]
        }
      });

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found or insufficient permissions' });
      }

      // Check if users exist
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } }
      });

      if (users.length !== userIds.length) {
        return res.status(400).json({ message: 'Some users do not exist' });
      }

      // Add members
      await prisma.chatMember.createMany({
        data: userIds.map((userId) => ({
          chatId: parseInt(id),
          userId,
          role: 'MEMBER'
        })),
        skipDuplicates: true
      });

      const updatedChat = await prisma.chat.findUnique({
        where: { id: parseInt(id) },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true
                }
              }
            }
          }
        }
      });

      res.json(updatedChat);
    } catch (error) {
      next(error);
    }
  }
];

export const removeMember = [
  ...validateChatId,
  param('memberId').isInt({ min: 1 }).withMessage('Member ID must be a positive integer'),
  handleValidationErrors,
  async (req, res, next) => {
    const { id, memberId } = req.params;
    const userId = req.user?.id;

    try {
      const chat = await prisma.chat.findFirst({
        where: {
          id: parseInt(id),
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                  role: 'ADMIN'
                }
              }
            }
          ]
        }
      });

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found or insufficient permissions' });
      }

      const member = await prisma.chatMember.findFirst({
        where: {
          chatId: parseInt(id),
          userId: parseInt(memberId)
        }
      });

      if (!member) {
        return res.status(404).json({ message: 'Member not found in this chat' });
      }

      await prisma.chatMember.delete({
        where: { id: member.id }
      });

      res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
      next(error);
    }
  }
];

export const leaveChat = [
  ...validateChatId,
  handleValidationErrors,
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;

    try {
      const member = await prisma.chatMember.findFirst({
        where: {
          chatId: parseInt(id),
          userId
        }
      });

      if (!member) {
        return res.status(404).json({ message: 'You are not a member of this chat' });
      }

      await prisma.chatMember.delete({
        where: { id: member.id }
      });

      res.status(200).json({ message: 'Left chat successfully' });
    } catch (error) {
      next(error);
    }
  }
];
