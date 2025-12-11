import { Router } from 'express';
import { createSubject, getSubjects, deleteSubject } from '../controllers/subjectsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', createSubject);
router.get('/', getSubjects);
router.delete('/:id', deleteSubject);

export default router;
