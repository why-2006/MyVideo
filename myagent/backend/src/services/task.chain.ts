import { RunnableLambda, RunnableParallel } from "@langchain/core/runnables";
import { huggingFaceService } from "./hf.service";
import { memoryService, type TaskMemoryHistoryItem } from "./memory.service";

const TEXT_MODEL_ID = "Qwen/Qwen2.5-7B-Instruct";
const IMAGE_MODEL_ID = "google/vit-large-patch16-224";
const AUDIO_MODEL_ID = "openai/whisper-large-v3";
const HISTORY_WINDOW_SIZE = 10;
const HISTORY_TOTAL_CHAR_BUDGET = 2500;

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
  evidencePrompt?: string;
  historyPrompt?: string;
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
//构建证据块，整合不同模态的推理结果，供文本总结使用
function buildEvidenceBlock(results: ModalityResult[]): string {
  const evidenceItems: string[] = [];

  for (const item of results) {
    if (item.modality !== "image" && item.modality !== "audio") {
      continue;
    }

    if (!item.success) {
      evidenceItems.push(
        `[${item.modality}] 推理失败: ${item.error || "unknown error"}`,
      );
      continue;
    }

    evidenceItems.push(
      `[${item.modality}] 证据: ${normalizeOutput(item.output)}`,
    );
  }

  if (evidenceItems.length === 0) {
    return "无可用图像/音频证据";
  }

  return evidenceItems.join("\n");
}

function buildHistoryPrompt(memories: TaskMemoryHistoryItem[]): string {
  if (!memories.length) {
    return "无历史记忆";
  }

  const chunks: string[] = [];
  let usedChars = 0;

  for (const item of memories) {
    const snapshot = [
      `时间: ${item.createdAt}`,
      `输入: ${item.inputText || "(无文本)"}; hasImage=${item.hasImage}; hasAudio=${item.hasAudio}`,
      `结果: success=${item.successCount}, failure=${item.failureCount}`,
      `摘要: ${item.finalSummary}`,
    ].join(" | ");
    // 计算剩余字符预算，确保不超过总限制，优先保留最新的历史记录，并在必要时对单条记录进行截断，避免因单条过长而丢失全部历史上下文。
    const remaining = HISTORY_TOTAL_CHAR_BUDGET - usedChars;
    if (remaining <= 0) {
      break;
    }

    const maxSnapshotLen = Math.max(remaining - 1, 0);
    if (maxSnapshotLen <= 0) {
      break;
    }

    if (snapshot.length <= maxSnapshotLen) {
      chunks.push(snapshot);
      usedChars += snapshot.length + 1;
      continue;
    }

    // 至少保留一条被截断的最新历史，避免因单条过长而丢失全部历史上下文。
    const truncated =
      maxSnapshotLen > 12
        ? `${snapshot.slice(0, maxSnapshotLen - 3)}...`
        : snapshot.slice(0, maxSnapshotLen);

    if (truncated.trim()) {
      chunks.push(truncated);
      usedChars += truncated.length + 1;
    }

    break;
  }

  if (!chunks.length) {
    return "无历史记忆";
  }

  return chunks.map((item, index) => `${index + 1}. ${item}`).join("\n");
}
//构建基于证据的问答提示词，指导文本模型根据多模态证据和历史记忆回答用户问题
function buildGroundedQaPrompt(
  evidence: string,
  historyPrompt: string,
  userQuestion?: string,
): string {
  return [
    "你是一个多模态问答助手。",
    "请严格根据给定证据回答用户问题，不要臆测。",
    "回答优先级：当前多模态证据 > 历史记忆 > 常识。",
    "若不能从历史记忆中获取有用信息则不要提及。",
    "若证据不足或相关模态失败，请明确说明不确定性。",
    "不要编造历史中不存在的细节。",
    "",
    `用户问题: ${userQuestion}`,
    "",
    "历史记忆:",
    historyPrompt,
    "",
    "多模态证据:",
    evidence,
    "",
    "请直接给出中文答案：",
  ].join("\n");
}
//生成总结提示词，包含输入模态信息、成功失败结果等，指导生成模型输出最终总结
// function buildSummaryPrompt(results: ModalityResult[]): string {
//   const successItems = results.filter((item) => item.success);

//   return [
//     "你是一个多模态结果总结助手。",
//     "请根据以下不同模态的推理结果，输出一段结构清晰、简洁中文总结。",
//     "如果有失败项，请在最后Tips指出失败模态并给出谨慎说明。",
//     "",
//     `输入模态数: ${results.length}`,
//     `成功: ${successItems.length}`,
//     `失败: ${results.length - successItems.length}`,
//     "",
//     ...results.map((item, index) => {
//       if (!item.success) {
//         return `${index + 1}. [${item.modality}] 失败: ${item.error}`;
//       }

//       return `${index + 1}. [${item.modality}] 成功输出: ${normalizeOutput(item.output)}`;
//     }),
//     "",
//     "根据各个模态的结果给出最终输出：",
//   ].join("\n");
// }

function createMultimodalSummaryChain() {
  // 定义每个模态的推理步骤，串联成一个整体流程
  const loadHistoryMemory = RunnableLambda.from(
    async (context: ChainContext) => {
      try {
        const memories = await memoryService.getRecentTaskMemoriesByUser(
          context.userId,
          HISTORY_WINDOW_SIZE,
        );

        return {
          ...context,
          historyPrompt: buildHistoryPrompt(memories),
        };
      } catch (error) {
        console.warn("Failed to load conversation memory:", error);
        return {
          ...context,
          historyPrompt: "无历史记忆",
        };
      }
    },
  );

  const loadEvidencePrompt = RunnableLambda.from(
    async (context: ChainContext) => {
      return {
        ...context,
        evidencePrompt: buildEvidenceBlock(context.modalityResults),
      };
    },
  );

  const appendTextResult = RunnableLambda.from(
    async (context: ChainContext) => {
      const nextResults = [...context.modalityResults];
      if (context.input.text && context.input.text.trim()) {
        try {
          const evidence =
            context.evidencePrompt ||
            buildEvidenceBlock(context.modalityResults);
          const groundedPrompt = buildGroundedQaPrompt(
            context.input.text.trim(),
            evidence,
            context.historyPrompt || "无历史记忆",
          );

          const textResult = await huggingFaceService.textInference(
            TEXT_MODEL_ID,
            groundedPrompt,
            {
              temperature: 0.1,
              top_p: 0.6,
              max_tokens: 500,
            },
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

  const generateSummary = RunnableLambda.from(async (context: ChainContext) => {
    const evidence =
      context.evidencePrompt || buildEvidenceBlock(context.modalityResults);
    const groundedPrompt = buildGroundedQaPrompt(
      evidence,
      context.historyPrompt || "无历史记忆",
      context.input.text?.trim(),
    );

    const summaryResult = await huggingFaceService.textInference(
      TEXT_MODEL_ID,
      groundedPrompt,
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
  //并行处理图像和音频模态的推理，等待结果后继续文本总结的生成
  const middleware = RunnableLambda.from(async (context: ChainContext) => {
    const parallel = RunnableParallel.from({
      ImageResult: appendImageResult,
      AudioResult: appendAudioResult,
    });
    const middleData = parallel.invoke(context);
    return {
      ...context,
      modalityResults: [
        ...context.modalityResults,
        ...(await middleData).AudioResult.modalityResults,
        ...(await middleData).ImageResult.modalityResults,
      ],
    };
  });
  //串联文本结果处理、并行图像音频处理、准备总结提示词、生成总结的整体流程
  return middleware
    .pipe(loadHistoryMemory)
    .pipe(loadEvidencePrompt)
    .pipe(generateSummary);
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
