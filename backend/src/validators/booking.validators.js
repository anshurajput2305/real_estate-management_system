import { body } from 'express-validator';

export const bookingRules = [
  body('property').isMongoId(),
  body('type').isIn(['visit', 'rent_request', 'buy_request']),
  body('visitDate').optional().isISO8601(),
  body('message').optional().trim().isLength({ max: 1000 })
];

export const paymentRules = [body('booking').isMongoId(), body('method').isIn(['card', 'upi', 'wallet']), body('amount').optional().isFloat({ min: 1 })];
