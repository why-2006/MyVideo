import { Router } from 'express';
import { textInference, imageInference, audioInference } from '../controllers/hf.controller';

const router = Router();

router.post('/text/:id', textInference);
router.post('/image/:id', imageInference);
router.post('/audio/:id', audioInference);

export default router;
