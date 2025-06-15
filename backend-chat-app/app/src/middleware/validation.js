import { body, param, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateUsername = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
];

export const validateUserId = [param('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer')];
