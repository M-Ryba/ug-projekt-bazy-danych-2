import express from 'express';
import { checkJwt, syncUserWithDatabase } from '../middleware/auth.js';

import userRouter from './users.js';
import adminRouter from './admin.js';
import contactsRouter from './contacts.js';
import blocksRouter from './blocks.js';
import chatsRouter from './chats.js';
import statusRouter from './status.js';
import notificationsRouter from './notifications.js';

const router = express.Router();
// Middleware to authenticate user by JWT and sync user with database for all API routes
router.use(checkJwt, syncUserWithDatabase);

router.get('/', (req, res) => {
  res.send('Welcome to the ChatApp API');
});

router.use('/admin', adminRouter);
router.use('/users', userRouter);
router.use('/contacts', contactsRouter);
router.use('/blocks', blocksRouter);
router.use('/chats', chatsRouter);
router.use('/status', statusRouter);
router.use('/notifications', notificationsRouter);

export default router;
