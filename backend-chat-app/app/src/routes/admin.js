import express from 'express';
import { getAllUsers, getUserStats, deleteUser } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/permissions.js';

const router = express.Router();

// All admin routes require admin permissions
router.use(requireAdmin);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserStats);
router.delete('/users/:userId', deleteUser);

export default router;
