import { Router } from 'express';
import { chat } from '../controllers/chatController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', chat);

export default router;
