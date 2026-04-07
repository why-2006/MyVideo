import { huggingFaceService } from "./hf.service";

const TEXT_MODEL_ID = "katanemo/Arch-Router-1.5B:hf-inference";
const IMAGE_MODEL_ID = "google/vit-base-patch16-224";
const AUDIO_MODEL_ID = "openai/whisper-large-v3";

interface TaskInput {
  text?: string;
  image?: {
    buffer: Buffer;
    contentType?: string;
  };
  audio?: {
    buffer: Buffer;
    contentType?: string;
  };
}

interface ModalityResult {
  modality: "text" | "image" | "audio";
  modelId: string;
  success: boolean;
  output?: unknown;
  error?: string;
}

interface TaskResult {
  finalSummary: string;
  modalityResults: ModalityResult[];
  meta: {
    durationMs: number;
    successCount: number;
    failureCount: number;
  };
}

function normalizeOutput(output: unknown): string {
  if (typeof output === "string") {
    return output;
  }

  if (output && typeof output === "object") {
    return JSON.stringify(output);
  }

  return String(output);
}

export class TaskService {
  async runMultimodalSummaryTask(input: TaskInput): Promise<TaskResult> {
    const startedAt = Date.now();
    const modalityResults: ModalityResult[] = [];

    if (input.text && input.text.trim()) {
      try {
        const textResult = await huggingFaceService.textInference(
          TEXT_MODEL_ID,
          input.text.trim(),
        );

        modalityResults.push({
          modality: "text",
          modelId: TEXT_MODEL_ID,
          success: true,
          output: textResult,
        });
      } catch (error: any) {
        modalityResults.push({
          modality: "text",
          modelId: TEXT_MODEL_ID,
          success: false,
          error: error?.message || "Text inference failed",
        });
      }
    }

    if (input.image?.buffer) {
      try {
        const imageResult = await huggingFaceService.imageInference(
          IMAGE_MODEL_ID,
          input.image.buffer,
          undefined,
          input.image.contentType,
        );

        modalityResults.push({
          modality: "image",
          modelId: IMAGE_MODEL_ID,
          success: true,
          output: imageResult,
        });
      } catch (error: any) {
        modalityResults.push({
          modality: "image",
          modelId: IMAGE_MODEL_ID,
          success: false,
          error: error?.message || "Image inference failed",
        });
      }
    }

    if (input.audio?.buffer) {
      try {
        const audioResult = await huggingFaceService.audioInference(
          AUDIO_MODEL_ID,
          input.audio.buffer,
          undefined,
          input.audio.contentType,
        );

        modalityResults.push({
          modality: "audio",
          modelId: AUDIO_MODEL_ID,
          success: true,
          output: audioResult,
        });
      } catch (error: any) {
        modalityResults.push({
          modality: "audio",
          modelId: AUDIO_MODEL_ID,
          success: false,
          error: error?.message || "Audio inference failed",
        });
      }
    }

    const successItems = modalityResults.filter((item) => item.success);
    if (successItems.length === 0) {
      const error = new Error("All modality inference steps failed");
      (error as any).statusCode = 502;
      throw error;
    }

    const summaryPrompt = [
      "你是一个多模态结果总结助手。",
      "请根据以下不同模态的推理结果，输出一段结构清晰、简洁中文总结。",
      "如果有失败项，请明确指出失败模态并给出谨慎说明。",
      "",
      `输入模态数: ${modalityResults.length}`,
      `成功: ${successItems.length}`,
      `失败: ${modalityResults.length - successItems.length}`,
      "",
      ...modalityResults.map((item, index) => {
        if (!item.success) {
          return `${index + 1}. [${item.modality}] 失败: ${item.error}`;
        }

        return `${index + 1}. [${item.modality}] 成功输出: ${normalizeOutput(item.output)}`;
      }),
      "",
      "请输出：",
      "1) 总体结论",
      "2) 分模态要点",
      "3) 不确定性与建议",
    ].join("\n");

    const summaryResult = await huggingFaceService.textInference(
      TEXT_MODEL_ID,
      summaryPrompt,
      {
        temperature: 0.2,
        max_tokens: 500,
      },
    );

    const durationMs = Date.now() - startedAt;
    const failureCount = modalityResults.length - successItems.length;

    return {
      finalSummary:
        summaryResult.generated_text ||
        "总结模型未返回文本，请查看分模态结果。",
      modalityResults,
      meta: {
        durationMs,
        successCount: successItems.length,
        failureCount,
      },
    };
  }
}

export const taskService = new TaskService();
