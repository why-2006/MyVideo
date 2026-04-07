import { Router } from "express";
import { runMultimodalSummaryTask } from "../controllers/task.controller";
import { inferenceUpload } from "../middleware/upload";

const router = Router();

router.post(
  "/multimodal-summary",
  inferenceUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  runMultimodalSummaryTask,
);

export default router;
