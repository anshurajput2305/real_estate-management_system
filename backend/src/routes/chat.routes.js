import { Router } from 'express';
import { getOrCreateChat, messages, myChats, sendMessage } from '../controllers/chat.controller.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);
router.get('/', myChats);
router.post('/', getOrCreateChat);
router.get('/:chatId/messages', messages);
router.post('/:chatId/messages', sendMessage);

export default router;
