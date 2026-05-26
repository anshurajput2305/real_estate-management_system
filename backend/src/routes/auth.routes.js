import { Router } from 'express';
import { changePassword, forgotPassword, login, logout, me, refresh, resetPassword, signup, updateProfile, verifyEmail } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { changePasswordRules, forgotRules, loginRules, resetRules, signupRules } from '../validators/auth.validators.js';

const router = Router();

router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotRules, validate, forgotPassword);
router.post('/reset-password', resetRules, validate, resetPassword);
router.post('/verify-email', verifyEmail);
router.get('/me', protect, me);
router.patch('/profile', protect, updateProfile);
router.patch('/password', protect, changePasswordRules, validate, changePassword);

export default router;
