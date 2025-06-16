import prisma from '../../prisma/client.js';
import { body, param, query } from 'express-validator';
import handleValidationErrors from '../middleware/handleValidationErrors.js';

const validateNotificationId = [param('id').isInt({ min: 1 }).withMessage('Notification ID must be a positive integer')];

const validateNotificationCreate = [
  body('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  body('type').isIn(['MESSAGE', 'INVITE', 'SYSTEM']).withMessage('Invalid notification type'),
  body('content').notEmpty().isLength({ min: 1, max: 1000 }).withMessage('Content must be between 1 and 1000 characters')
];

const validateMarkAsRead = [
  body('notificationIds').isArray({ min: 1 }).withMessage('Notification IDs must be an array with at least one ID'),
  body('notificationIds.*').isInt({ min: 1 }).withMessage('Each notification ID must be a positive integer')
];

const validateGetNotifications = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isRead').optional().isBoolean().withMessage('isRead must be a boolean'),
  query('type').optional().isIn(['MESSAGE', 'INVITE', 'SYSTEM']).withMessage('Invalid notification type')
];

export const getNotifications = [
  ...validateGetNotifications,
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user?.id;

      const { page = 1, limit = 20, isRead, type } = req.query;
      const skip = (page - 1) * limit;

      const where = {
        userId,
        ...(isRead !== undefined && { isRead: isRead === 'true' }),
        ...(type && { type })
      };

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.notification.count({ where })
      ]);

      res.json({
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error while fetching notifications', error: error.message });
    }
  }
];

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Error while fetching unread count', error: error.message });
  }
};

export const createNotification = [
  ...validateNotificationCreate,
  handleValidationErrors,
  async (req, res) => {
    const { userId, type, content } = req.body;

    try {
      // Check if target user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ message: 'Target user not found' });
      }

      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          content
        }
      });

      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ message: 'Error while creating notification', error: error.message });
    }
  }
];

export const markAsRead = [
  ...validateMarkAsRead,
  handleValidationErrors,
  async (req, res) => {
    const { notificationIds } = req.body;
    const userId = req.user?.id;

    try {
      const result = await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      res.json({
        message: 'Notifications marked as read',
        updatedCount: result.count
      });
    } catch (error) {
      res.status(500).json({ message: 'Error while marking notifications as read', error: error.message });
    }
  }
];

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({
      message: 'All notifications marked as read',
      updatedCount: result.count
    });
  } catch (error) {
    res.status(500).json({ message: 'Error while marking all notifications as read', error: error.message });
  }
};

export const deleteNotification = [
  ...validateNotificationId,
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;

    try {
      await prisma.notification.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error while deleting notification', error: error.message });
    }
  }
];
