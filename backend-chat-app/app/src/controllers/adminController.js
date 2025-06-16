import prisma from '../../prisma/client.js';
import Message from '../../mongoose/models/Message.js';
import UserStatus from '../../mongoose/models/UserStatus.js';
import { handleValidationErrors, validateUserId } from '../middleware/validation.js';

export const getAllUsers = [
  async (req, res, next) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
];

export const getUserStats = [
  ...validateUserId,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              username: true,
              chats: true,
              notifications: true,
              contacts: true,
              blockedUsers: true,
              blockedBy: true
            }
          }
        }
      });

      if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        return next(err);
      }

      // Get message count from MongoDB
      const messageCount = await Message.countDocuments({ senderId: user.id });

      // Get user status from MongoDB
      const userStatus = await UserStatus.findOne({ userId: user.id });

      res.json({
        ...user,
        messageCount,
        status: userStatus || { status: 'OFFLINE', lastActive: null }
      });
    } catch (error) {
      next(error);
    }
  }
];

export const deleteUser = [
  ...validateUserId,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        return next(err);
      }

      // Delete user's messages from MongoDB
      await Message.deleteMany({ senderId: user.id });
      await UserStatus.deleteOne({ userId: user.id });

      // Delete user from database
      await prisma.user.delete({
        where: { id: user.id }
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
];
