import { Router } from 'express';
import { createResource, getResources, deleteResource } from '../controllers/resourcesController';
import { requireAuth } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

router.use(requireAuth);

router.post('/', upload.single('file'), createResource);
router.get('/', getResources);
router.delete('/:id', deleteResource);

export default router;
