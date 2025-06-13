import express from 'express';
import { getBlocks, blockUser, unblockUser } from '../controllers/blocksController.js';

const router = express.Router();

router.get('/', getBlocks);
router.post('/', blockUser);
router.delete('/:id', unblockUser);

export default router;
