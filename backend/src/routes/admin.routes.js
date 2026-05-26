import { Router } from 'express';
import { analytics, announcement, approveAgent, listAgentProfiles, listReports, moderateListing, updateReport } from '../controllers/admin.controller.js';
import { allowRoles, protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect, allowRoles('admin'));
router.get('/analytics', analytics);
router.get('/agents', listAgentProfiles);
router.patch('/agents/:id/verification', approveAgent);
router.patch('/listings/:id/moderate', moderateListing);
router.get('/reports', listReports);
router.patch('/reports/:id', updateReport);
router.post('/announcements', announcement);

export default router;
