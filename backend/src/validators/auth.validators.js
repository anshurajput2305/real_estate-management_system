import { body } from 'express-validator';

export const signupRules = [
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['customer', 'agent'])
];

export const loginRules = [body('email').isEmail().normalizeEmail(), body('password').notEmpty()];

export const forgotRules = [body('email').isEmail().normalizeEmail()];

export const resetRules = [body('token').notEmpty(), body('password').isLength({ min: 8 })];

export const changePasswordRules = [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 })];
