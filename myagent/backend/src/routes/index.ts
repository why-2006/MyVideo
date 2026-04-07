import { Router } from "express";
import authRoutes from "./auth";
import modelsRoutes from "./models";
import inferenceRoutes from "./inference";
import tasksRoutes from "./tasks";

const router = Router();

// API 路由
router.use("/auth", authRoutes);
router.use("/models", modelsRoutes);
router.use("/inference", inferenceRoutes);
router.use("/tasks", tasksRoutes);

export default router;
