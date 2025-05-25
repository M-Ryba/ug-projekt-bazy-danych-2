import express from 'express';

import userRouter from './api/users.js';

// Middleware for restricting API access to authenticated users
function requireAuth(req, res, next) {
  if (!res.locals.session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  res.send('Welcome to the ChatApp API');
});

router.use('/users', userRouter);

export default router;
