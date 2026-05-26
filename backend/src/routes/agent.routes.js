import { Router } from 'express';
import { agentAnalytics, getMyAgentProfile, upsertAgentProfile } from '../controllers/agent.controller.js';
import { allowRoles, protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect, allowRoles('agent'));
router.get('/me', getMyAgentProfile);
router.put('/me', upsertAgentProfile);
router.get('/analytics', agentAnalytics);

export default router;
