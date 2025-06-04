import express from 'express';
import { checkJwt, syncUserWithDatabase } from '../authMiddleware.js';

import userRouter from './users.js';
import messageRouter from './messages.js';

const router = express.Router();
// Middleware to check JWT authentication and sync user with database for all API routes
router.use(checkJwt, syncUserWithDatabase);

router.get('/', (req, res) => {
  res.send('Welcome to the ChatApp API');
});

router.use('/users', userRouter);
router.use('/messages', messageRouter);

export default router;
