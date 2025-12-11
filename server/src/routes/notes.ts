import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getNote, updateNote } from '../controllers/notesController';

const router = Router();

router.use(requireAuth);

router.get('/', getNote);
router.post('/', updateNote); // Using POST for upsert

export default router;
