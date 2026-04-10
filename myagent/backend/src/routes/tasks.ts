import { Router } from "express";
import { runMultimodalSummaryTask } from "../controllers/task.controller";
import { inferenceUpload } from "../middleware/upload";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post(
  "/multimodal-summary",
  authMiddleware,
  inferenceUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  runMultimodalSummaryTask,
);

export default router;
