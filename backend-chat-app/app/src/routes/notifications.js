import express from 'express';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notificationsController.js';
import { requireAuth, requireResourceOwnership } from '../middleware/permissions.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// User can see and manage only their own notifications
router.get('/', getNotifications); // Controller already filters by user
router.get('/unread-count', getUnreadCount); // Controller already filters by user
router.post('/', createNotification); // For creating notifications to other users
router.patch('/mark-read', markAsRead); // Controller already filters by user
router.patch('/mark-all-read', markAllAsRead); // Controller already filters by user

// Routes that require resource ownership
router.get('/:id', requireResourceOwnership('notification'), getNotificationById);
router.delete('/:id', requireResourceOwnership('notification'), deleteNotification);

export default router;
