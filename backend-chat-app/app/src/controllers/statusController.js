import UserStatus from '../../mongoose/models/UserStatus.js';
import { body, param } from 'express-validator';
import handleValidationErrors from '../middleware/handleValidationErrors.js';

// Validation middleware
const validateUserId = [param('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer')];
const validateStatusUpdate = [body('status').isIn(['ONLINE', 'OFFLINE', 'BUSY']).withMessage('Status must be ONLINE, OFFLINE, or BUSY')];

export const getStatus = [
  ...validateUserId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;

      let userStatus = await UserStatus.findOne({ userId: parseInt(userId) });

      if (!userStatus) {
        // Create default status if doesn't exist
        userStatus = await UserStatus.create({
          userId: parseInt(userId),
          status: 'OFFLINE',
          lastActive: new Date()
        });
      }

      res.json(userStatus);
    } catch (error) {
      res.status(500).json({ message: 'Error while fetching status', error: error.message });
    }
  }
];

export const updateStatus = [
  ...validateStatusUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { status } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userStatus = await UserStatus.findOneAndUpdate(
        { userId },
        {
          status,
          lastActive: new Date(),
          ...(status === 'ONLINE' && { lastActive: new Date() })
        },
        {
          new: true,
          upsert: true, // Create if doesn't exist
          setDefaultsOnInsert: true
        }
      );

      res.json({
        message: 'Status updated successfully',
        status: userStatus
      });
    } catch (error) {
      res.status(500).json({ message: 'Error while updating status', error: error.message });
    }
  }
];
