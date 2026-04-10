import { NextFunction, Request, Response } from "express";
import { taskService } from "../services/task.service";

export async function runMultimodalSummaryTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as Request & { user?: { userId: string } }).user
      ?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const files = req.files as
      | {
          [fieldname: string]: Express.Multer.File[];
        }
      | undefined;

    const text =
      typeof req.body?.text === "string" ? req.body.text.trim() : undefined;
    const imageFile = files?.image?.[0];
    const audioFile = files?.audio?.[0];

    if (!text && !imageFile && !audioFile) {
      return res.status(400).json({
        success: false,
        message: "At least one input is required: text, image, or audio",
      });
    }

    const result = await taskService.runMultimodalSummaryTask(
      {
        text,
        image: imageFile
          ? {
              buffer: imageFile.buffer,
              contentType: imageFile.mimetype,
            }
          : undefined,
        audio: audioFile
          ? {
              buffer: audioFile.buffer,
              contentType: audioFile.mimetype,
            }
          : undefined,
      },
      userId,
    );

    res.json({
      success: true,
      data: result,
      message: "Multimodal task completed successfully",
    });
  } catch (error) {
    next(error);
  }
}
