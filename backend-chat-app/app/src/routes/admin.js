import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, getStats } from '../controllers/adminController.js';

const router = express.Router();

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// System stats
router.get('/stats', getStats);

export default router;
