import express from 'express';
import { getStatus, updateStatus } from '../controllers/statusController.js';
import { requireResourceOwnership, canViewUserStatus } from '../middleware/permissions.js';

const router = express.Router();

router.get('/:userId', canViewUserStatus, getStatus);
router.patch('/', requireResourceOwnership('status'), updateStatus);

export default router;
