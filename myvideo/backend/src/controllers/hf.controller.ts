import { Request, Response, NextFunction } from "express";
import { huggingFaceService } from "../services/hf.service";
import type { HFModel } from "../types/hf";

function parseParameters(raw: unknown): any {
  if (typeof raw !== "string") {
    return raw;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/**
 * 获取模型列表
 */
export async function listModels(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string, 10)
      : 0;
    const search = req.query.search as string;
    const sort = req.query.sort as string;

    const models = await huggingFaceService.listModels();
    res.json({
      success: true,
      data: models,
      message: "Models fetched successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取模型详情
 */
export async function getModel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const model = await huggingFaceService.getModel(id);

    res.json({
      success: true,
      data: model,
      message: "Model fetched successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 文本推理
 */
export async function textInference(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { inputs, parameters } = req.body;

    if (!inputs) {
      return res.status(400).json({
        success: false,
        message: "Inputs is required",
      });
    }

    const result = await huggingFaceService.textInference(
      id,
      inputs,
      parameters,
    );

    res.json({
      success: true,
      data: result,
      message: "Text inference completed successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 图像推理
 */
export async function imageInference(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const parameters = parseParameters(req.body?.parameters);
    const file = (req as Request & { file?: Express.Multer.File }).file;
    const inputs = file?.buffer || req.body?.inputs;
    const contentType = file?.mimetype;

    if (!inputs) {
      return res.status(400).json({
        success: false,
        message: "File is required for image inference",
      });
    }

    const result = await huggingFaceService.imageInference(
      id,
      inputs,
      parameters,
      contentType,
    );

    res.json({
      success: true,
      data: result,
      message: "Image inference completed successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 音频推理
 */
export async function audioInference(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const parameters = parseParameters(req.body?.parameters);
    const file = (req as Request & { file?: Express.Multer.File }).file;
    const inputs = file?.buffer || req.body?.inputs;
    const contentType = file?.mimetype;

    if (!inputs) {
      return res.status(400).json({
        success: false,
        message: "File is required for audio inference",
      });
    }

    const result = await huggingFaceService.audioInference(
      id,
      inputs,
      parameters,
      contentType,
    );

    res.json({
      success: true,
      data: result,
      message: "Audio inference completed successfully",
    });
  } catch (error) {
    next(error);
  }
}
