import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { huggingFaceService } from "./hf.service";
import { memoryService } from "./memory.service";

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

interface ChainContext {
  startedAt: number;
  userId: string;
  input: TaskInput;
  modalityResults: ModalityResult[];
  summaryPrompt?: string;
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

function createFailedResult(
  modality: ModalityResult["modality"],
  modelId: string,
  error: unknown,
): ModalityResult {
  return {
    modality,
    modelId,
    success: false,
    error:
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : `${modality} inference failed`,
  };
}

function buildSummaryPrompt(results: ModalityResult[]): string {
  const successItems = results.filter((item) => item.success);

  return [
    "你是一个多模态结果总结助手。",
    "请根据以下不同模态的推理结果，输出一段结构清晰、简洁中文总结。",
    "如果有失败项，请在最后Tips指出失败模态并给出谨慎说明。",
    "",
    `输入模态数: ${results.length}`,
    `成功: ${successItems.length}`,
    `失败: ${results.length - successItems.length}`,
    "",
    ...results.map((item, index) => {
      if (!item.success) {
        return `${index + 1}. [${item.modality}] 失败: ${item.error}`;
      }

      return `${index + 1}. [${item.modality}] 成功输出: ${normalizeOutput(item.output)}`;
    }),
    "",
    "请总结各个模态的结果给出最终输出：",
  ].join("\n");
}

function createMultimodalSummaryChain() {
  const appendTextResult = RunnableLambda.from(
    async (context: ChainContext) => {
      const nextResults = [...context.modalityResults];

      if (context.input.text && context.input.text.trim()) {
        try {
          const textResult = await huggingFaceService.textInference(
            TEXT_MODEL_ID,
            context.input.text.trim(),
          );

          nextResults.push({
            modality: "text",
            modelId: TEXT_MODEL_ID,
            success: true,
            output: textResult,
          });
        } catch (error) {
          nextResults.push(createFailedResult("text", TEXT_MODEL_ID, error));
        }
      }

      return {
        ...context,
        modalityResults: nextResults,
      };
    },
  );

  const appendImageResult = RunnableLambda.from(
    async (context: ChainContext) => {
      const nextResults = [...context.modalityResults];

      if (context.input.image?.buffer) {
        try {
          const imageResult = await huggingFaceService.imageInference(
            IMAGE_MODEL_ID,
            context.input.image.buffer,
            undefined,
            context.input.image.contentType,
          );

          nextResults.push({
            modality: "image",
            modelId: IMAGE_MODEL_ID,
            success: true,
            output: imageResult,
          });
        } catch (error) {
          nextResults.push(createFailedResult("image", IMAGE_MODEL_ID, error));
        }
      }

      return {
        ...context,
        modalityResults: nextResults,
      };
    },
  );

  const appendAudioResult = RunnableLambda.from(
    async (context: ChainContext) => {
      const nextResults = [...context.modalityResults];

      if (context.input.audio?.buffer) {
        try {
          const audioResult = await huggingFaceService.audioInference(
            AUDIO_MODEL_ID,
            context.input.audio.buffer,
            undefined,
            context.input.audio.contentType,
          );

          nextResults.push({
            modality: "audio",
            modelId: AUDIO_MODEL_ID,
            success: true,
            output: audioResult,
          });
        } catch (error) {
          nextResults.push(createFailedResult("audio", AUDIO_MODEL_ID, error));
        }
      }

      return {
        ...context,
        modalityResults: nextResults,
      };
    },
  );

  const prepareSummaryPrompt = RunnableLambda.from(
    async (context: ChainContext) => {
      if (context.modalityResults.filter((item) => item.success).length === 0) {
        const error = new Error("All modality inference steps failed");
        (error as { statusCode?: number }).statusCode = 502;
        throw error;
      }

      return {
        ...context,
        summaryPrompt: buildSummaryPrompt(context.modalityResults),
      };
    },
  );

  const generateSummary = RunnableLambda.from(async (context: ChainContext) => {
    const summaryResult = await huggingFaceService.textInference(
      TEXT_MODEL_ID,
      context.summaryPrompt || "",
      {
        temperature: 0.1,
        top_p: 0.6,
        max_tokens: 500,
      },
    );

    const successCount = context.modalityResults.filter(
      (item) => item.success,
    ).length;

    const taskResult = {
      finalSummary:
        summaryResult.generated_text ||
        "总结模型未返回文本，请查看分模态结果。",
      modalityResults: context.modalityResults,
      meta: {
        durationMs: Date.now() - context.startedAt,
        successCount,
        failureCount: context.modalityResults.length - successCount,
      },
    } satisfies TaskResult;

    await memoryService.saveTaskMemory({
      userId: context.userId,
      taskType: "multimodal-summary",
      input: {
        text: context.input.text,
        hasImage: !!context.input.image?.buffer,
        hasAudio: !!context.input.audio?.buffer,
      },
      finalSummary: taskResult.finalSummary,
      modalityResults: taskResult.modalityResults,
      successCount: taskResult.meta.successCount,
      failureCount: taskResult.meta.failureCount,
    });

    return taskResult;
  });

  return RunnableSequence.from([
    appendTextResult,
    appendImageResult,
    appendAudioResult,
    prepareSummaryPrompt,
    generateSummary,
  ]);
}

const multimodalSummaryChain = createMultimodalSummaryChain();

export async function runMultimodalSummaryTaskChain(
  input: TaskInput,
  userId: string,
): Promise<TaskResult> {
  return multimodalSummaryChain.invoke({
    startedAt: Date.now(),
    userId,
    input,
    modalityResults: [],
  });
}
