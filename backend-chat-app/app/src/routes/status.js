import express from 'express';
import { getStatus, updateStatus } from '../controllers/statusController.js';

const router = express.Router();

router.get('/:userId', getStatus);
router.patch('/', updateStatus);

export default router;
