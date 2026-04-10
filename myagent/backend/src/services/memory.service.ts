import { db } from "./db.service";

interface TaskInputSnapshot {
  text?: string;
  hasImage: boolean;
  hasAudio: boolean;
}

interface ModalityResultSnapshot {
  modality: "text" | "image" | "audio";
  modelId: string;
  success: boolean;
  output?: unknown;
  error?: string;
}

interface SaveTaskMemoryInput {
  userId: string;
  taskType: "multimodal-summary";
  input: TaskInputSnapshot;
  finalSummary: string;
  modalityResults: ModalityResultSnapshot[];
  successCount: number;
  failureCount: number;
}

export class MemoryService {
  async saveTaskMemory(payload: SaveTaskMemoryInput): Promise<void> {
    const numericUserId = Number(payload.userId);
    if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
      throw new Error("Invalid user id for memory persistence");
    }

    await db.execute(
      `
      INSERT INTO task_memories (
        user_id,
        task_type,
        input_text,
        has_image,
        has_audio,
        final_summary,
        modality_results,
        success_count,
        failure_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        numericUserId,
        payload.taskType,
        payload.input.text || null,
        payload.input.hasImage ? 1 : 0,
        payload.input.hasAudio ? 1 : 0,
        payload.finalSummary,
        JSON.stringify(payload.modalityResults),
        payload.successCount,
        payload.failureCount,
      ],
    );
  }
}

export const memoryService = new MemoryService();
