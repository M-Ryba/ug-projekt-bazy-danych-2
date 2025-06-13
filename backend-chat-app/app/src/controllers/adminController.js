import prisma from '../../prisma/client.js';
import Message from '../../mongoose/models/message.js';
import UserStatus from '../../mongoose/models/UserStatus.js';
import { body, param, query, validationResult } from 'express-validator';

// Validation middleware
const validateUserId = [param('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer')];

const validateGetUsers = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ min: 1 }).withMessage('Search term must not be empty')
];

const validateUserUpdate = [
  body('username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('displayName').optional().isLength({ min: 1, max: 100 }).withMessage('Display name must be between 1 and 100 characters'),
  body('emailVerified').optional().isBoolean().withMessage('Email verified must be a boolean'),
  body('showStatus').optional().isBoolean().withMessage('Show status must be a boolean'),
  body('allowInvites').optional().isBoolean().withMessage('Allow invites must be a boolean')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Middleware to check admin permissions
const checkAdminPermissions = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin permissions', error: error.message });
  }
};

export const getAllUsers = [
  checkAdminPermissions,
  ...validateGetUsers,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [
              { username: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { displayName: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            emailVerified: true,
            showStatus: true,
            allowInvites: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                chats: true,
                notifications: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error while fetching users', error: error.message });
    }
  }
];

export const getUserById = [
  checkAdminPermissions,
  ...validateUserId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: {
          _count: {
            select: {
              chats: true,
              notifications: true,
              contactsAsOwner: true,
              contactsAsContact: true,
              blockedUsers: true,
              blockedBy: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get message count from MongoDB
      const messageCount = await Message.countDocuments({ senderId: userId });

      // Get user status from MongoDB
      const userStatus = await UserStatus.findOne({ userId: parseInt(userId) });

      res.json({
        ...user,
        messageCount,
        status: userStatus || { status: 'OFFLINE', lastActive: null }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error while fetching user', error: error.message });
    }
  }
];

export const updateUser = [
  checkAdminPermissions,
  ...validateUserId,
  ...validateUserUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: updateData
      });

      res.json(updatedUser);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Username or email already exists' });
      }
      res.status(500).json({ message: 'Error while updating user', error: error.message });
    }
  }
];

export const deleteUser = [
  checkAdminPermissions,
  ...validateUserId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete user's messages from MongoDB
      await Message.deleteMany({ senderId: userId });
      await UserStatus.deleteOne({ userId: parseInt(userId) });

      // Delete user from PostgreSQL (cascading will handle related records)
      await prisma.user.delete({
        where: { id: parseInt(userId) }
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error while deleting user', error: error.message });
    }
  }
];

export const getStats = [
  checkAdminPermissions,
  async (req, res) => {
    try {
      const [userCount, chatCount, notificationCount, contactCount, blockCount] = await Promise.all([
        prisma.user.count(),
        prisma.chat.count(),
        prisma.notification.count(),
        prisma.contact.count(),
        prisma.block.count()
      ]);

      const messageCount = await Message.countDocuments();
      const activeUserCount = await UserStatus.countDocuments({
        status: { $ne: 'OFFLINE' },
        lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      });

      // Recent activity (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const [newUsersThisWeek, newChatsThisWeek, newNotificationsThisWeek] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.chat.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.notification.count({ where: { createdAt: { gte: weekAgo } } })
      ]);

      const newMessagesThisWeek = await Message.countDocuments({
        createdAt: { $gte: weekAgo }
      });

      res.json({
        totals: {
          users: userCount,
          chats: chatCount,
          messages: messageCount,
          notifications: notificationCount,
          contacts: contactCount,
          blocks: blockCount,
          activeUsers: activeUserCount
        },
        thisWeek: {
          newUsers: newUsersThisWeek,
          newChats: newChatsThisWeek,
          newMessages: newMessagesThisWeek,
          newNotifications: newNotificationsThisWeek
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error while fetching stats', error: error.message });
    }
  }
];
