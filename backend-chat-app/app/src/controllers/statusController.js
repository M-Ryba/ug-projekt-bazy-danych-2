import UserStatus from '../../mongoose/models/UserStatus.js';
import { body, param } from 'express-validator';
import handleValidationErrors from '../middleware/validation.js';

const validateUserId = [param('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer')];
const validateStatusUpdate = [body('status').isIn(['ONLINE', 'OFFLINE', 'BUSY']).withMessage('Status must be ONLINE, OFFLINE, or BUSY')];

export const getStatus = [
  ...validateUserId,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { userId } = req.params;

      let userStatus = await UserStatus.findOne({ userId: parseInt(userId) });

      // Create a default status if it doesn't exist
      if (!userStatus) {
        userStatus = await UserStatus.create({
          userId: parseInt(userId)
        });
      }

      res.json(userStatus);
    } catch (error) {
      next(error);
    }
  }
];

export const updateStatus = [
  ...validateStatusUpdate,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const userId = req.user?.id;

      const userStatus = await UserStatus.findOneAndUpdate(
        { userId },
        {
          status,
          lastActive: new Date(),
          ...(status === 'ONLINE' && { lastActive: new Date() }) // If status is ONLINE, update lastActive
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
      next(error);
    }
  }
];
