import express from 'express';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/notificationsController.js';
const router = express.Router();

// GET /api/notifications
router.get('/', getNotifications);
// PATCH /api/notifications/:notificationId/read
router.patch('/:notificationId/read', markNotificationRead);
// PATCH /api/notifications/read-all
router.patch('/read-all', markAllNotificationsRead);

export default router;
