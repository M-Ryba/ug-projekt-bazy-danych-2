import express from 'express';
import { getStatus, updateStatus } from '../controllers/statusController.js';
const router = express.Router();

// GET /api/status/:userId
router.get('/:userId', getStatus);
// PATCH /api/status
router.patch('/', updateStatus);

export default router;
