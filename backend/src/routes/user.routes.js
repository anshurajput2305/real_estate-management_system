import { Router } from 'express';
import { createReport, listUsers, updateUserStatus } from '../controllers/user.controller.js';
import { allowRoles, protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);
router.post('/reports', createReport);
router.get('/', allowRoles('admin'), listUsers);
router.patch('/:id/status', allowRoles('admin'), updateUserStatus);

export default router;
