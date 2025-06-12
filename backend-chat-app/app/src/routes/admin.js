import express from 'express';
import { getAllUsers, deleteUser, getStats } from '../controllers/adminController.js';
const router = express.Router();

// GET /api/admin/users
router.get('/users', getAllUsers);
// DELETE /api/admin/users/:userId
router.delete('/users/:userId', deleteUser);
// GET /api/admin/stats
router.get('/stats', getStats);

export default router;
