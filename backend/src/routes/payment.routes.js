import { Router } from 'express';
import { createPayment, listPayments } from '../controllers/payment.controller.js';
import { allowRoles, protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { paymentRules } from '../validators/booking.validators.js';

const router = Router();

router.use(protect);
router.get('/', listPayments);
router.post('/', allowRoles('customer'), paymentRules, validate, createPayment);

export default router;
