import express from 'express';
import { getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { requireAuth, requireResourceOwnership, canViewUserProfile } from '../middleware/permissions.js';

const router = express.Router();

// All routes require authentication except registration
router.post('/', createUser); // Registration (no auth required)

// All other routes require authentication
router.use(requireAuth);

// Routes that require viewing permissions
router.get('/:id', canViewUserProfile, getUserById);

// Routes that require resource ownership (user can only edit/delete themselves)
router.put('/:id', requireResourceOwnership('user'), updateUser);
router.delete('/:id', requireResourceOwnership('user'), deleteUser);

export default router;
