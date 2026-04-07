import { Router } from "express";
import {
  textInference,
  imageInference,
  audioInference,
} from "../controllers/hf.controller";
import { inferenceUpload } from "../middleware/upload";

const router = Router();

router.post("/text/:id", textInference);
router.post("/image/:id", inferenceUpload.single("file"), imageInference);
router.post("/audio/:id", inferenceUpload.single("file"), audioInference);

export default router;
