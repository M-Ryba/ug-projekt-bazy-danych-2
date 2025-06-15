import express from 'express';
import { getUserByUsername, updateUser } from '../controllers/userController.js';
import { requireResourceOwnership, canViewUserProfile } from '../middleware/permissions.js';

const router = express.Router();

router.get('/:id', canViewUserProfile, getUserByUsername);

router.put('/:id', requireResourceOwnership('user'), updateUser);

export default router;
