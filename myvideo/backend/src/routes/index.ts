import { Router } from 'express';
import authRoutes from './auth';
import modelsRoutes from './models';
import inferenceRoutes from './inference';

const router = Router();

// API 路由
router.use('/auth', authRoutes);
router.use('/models', modelsRoutes);
router.use('/inference', inferenceRoutes);

export default router;
