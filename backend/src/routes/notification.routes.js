import { Router } from 'express';
import { listNotifications, markRead } from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);
router.get('/', listNotifications);
router.patch('/read', markRead);
router.patch('/:id/read', markRead);

export default router;
