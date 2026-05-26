import { Router } from 'express';
import { createReview, hideReview, listReviews } from '../controllers/review.controller.js';
import { allowRoles, protect } from '../middlewares/auth.js';

const router = Router();

router.get('/', listReviews);
router.post('/', protect, allowRoles('customer'), createReview);
router.patch('/:id/hide', protect, allowRoles('admin'), hideReview);

export default router;
