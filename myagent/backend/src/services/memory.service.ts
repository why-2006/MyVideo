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

export interface TaskMemoryHistoryItem {
  inputText?: string;
  hasImage: boolean;
  hasAudio: boolean;
  finalSummary: string;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

interface TaskMemoryHistoryRow {
  input_text: string | null;
  has_image: number;
  has_audio: number;
  final_summary: string;
  success_count: number;
  failure_count: number;
  created_at: Date | string;
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

  async getRecentTaskMemoriesByUser(
    userId: string,
    limit = 10,
  ): Promise<TaskMemoryHistoryItem[]> {
    // 验证用户ID的有效性，确保是正整数，防止SQL注入和无效查询
    const numericUserId = Number(userId);
    if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
      throw new Error("Invalid user id for memory retrieval");
    }
    //限制返回的记录数，默认10条，最大不超过20条，防止一次性查询过多数据导致性能问题
    const normalizedLimit =
      Number.isInteger(limit) && limit > 0 ? Math.min(limit, 20) : 10;

    const [rows] = await db.execute(
      `
      SELECT
        input_text,
        has_image,
        has_audio,
        final_summary,
        success_count,
        failure_count,
        created_at
      FROM task_memories
      WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT ${normalizedLimit}
      `,
      [numericUserId],
    );

    return (rows as TaskMemoryHistoryRow[]).map((row) => ({
      inputText: row.input_text || undefined,
      hasImage: row.has_image === 1,
      hasAudio: row.has_audio === 1,
      finalSummary: row.final_summary,
      successCount: row.success_count,
      failureCount: row.failure_count,
      // 将数据库中的日期对象或字符串统一转换为ISO格式的字符串，确保前端接收到的时间格式一致且易于处理
      createdAt:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
    }));
  }
}

export const memoryService = new MemoryService();
