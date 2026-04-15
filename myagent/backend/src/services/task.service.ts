import { runMultimodalSummaryTaskChain } from "./task.chain";

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

export class TaskService {
  async runMultimodalSummaryTask(
    input: TaskInput,
    userId: string,
  ): Promise<TaskResult> {
    return runMultimodalSummaryTaskChain(input, userId);
  }
}
//导出实例化对象，初始化逻辑，共享状态
export const taskService = new TaskService();
