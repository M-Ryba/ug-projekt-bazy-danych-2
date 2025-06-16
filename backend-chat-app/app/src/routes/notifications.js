import express from 'express';
import { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from '../controllers/notificationsController.js';
import { requireResourceOwnership } from '../middleware/permissions.js';

const router = express.Router();

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/', createNotification);
router.patch('/mark-read', markAsRead);
router.patch('/mark-all-read', markAllAsRead);
router.delete('/:id', requireResourceOwnership('notification'), deleteNotification);

export default router;
