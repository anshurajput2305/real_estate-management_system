import { Router } from 'express';
import { createBooking, getBooking, listBookings, updateBookingStatus } from '../controllers/booking.controller.js';
import { allowRoles, protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { bookingRules } from '../validators/booking.validators.js';

const router = Router();

router.use(protect);
router.get('/', listBookings);
router.get('/:id', getBooking);
router.post('/', allowRoles('customer'), bookingRules, validate, createBooking);
router.patch('/:id/status', allowRoles('agent', 'admin'), updateBookingStatus);

export default router;
