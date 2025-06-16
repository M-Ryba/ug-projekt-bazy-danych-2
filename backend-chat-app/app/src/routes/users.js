import express from 'express';
import { getUserById, getUserByUsername, updateUser, getSelf } from '../controllers/userController.js';
import { requireResourceOwnership, canViewUserProfile } from '../middleware/permissions.js';

const router = express.Router();

router.get('/me', getSelf);

router.get('/:id', canViewUserProfile, getUserById);

router.get('/:id', canViewUserProfile, getUserByUsername);

router.put('/:id', requireResourceOwnership('user'), updateUser);

export default router;
