import express from 'express';
import { blockUser, unblockUser } from '../controllers/blocksController.js';
const router = express.Router();

// POST /api/blocks
router.post('/', blockUser);
// DELETE /api/blocks/:blockedId
router.delete('/:blockedId', unblockUser);

export default router;
