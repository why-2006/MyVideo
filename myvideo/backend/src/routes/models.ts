import { Router } from 'express';
import { listModels, getModel } from '../controllers/hf.controller';

const router = Router();

router.get('/', listModels);
router.get('/:id', getModel);

export default router;
