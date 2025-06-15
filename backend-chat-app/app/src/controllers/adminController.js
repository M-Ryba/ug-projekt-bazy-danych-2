import prisma from '../../prisma/client.js';
import Message from '../../mongoose/models/Message.js';
import UserStatus from '../../mongoose/models/UserStatus.js';
import { handleValidationErrors, validateUserId } from '../middleware/validation.js';

export const getAllUsers = [
  async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error while fetching users', error: error.message });
    }
  }
];

export const getUserStats = [
  ...validateUserId,
  handleValidationErrors,
  async (req, res) => {
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
        return res.status(404).json({ message: 'User not found' });
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
      res.status(500).json({ message: 'Error while fetching user stats', error: error.message });
    }
  }
];

export const deleteUser = [
  ...validateUserId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
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
      res.status(500).json({ message: 'Error while deleting user', error: error.message });
    }
  }
];
