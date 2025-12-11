import { Router } from 'express';
import { createTerm, getTerms, deleteTerm } from '../controllers/termsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', createTerm);
router.get('/', getTerms);
router.delete('/:id', deleteTerm);

export default router;
