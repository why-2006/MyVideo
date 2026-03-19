import apiClient from "./api";
import type { HFModel, HFInferenceResponse } from "@/types/api";

export class HuggingFaceService {
  /**
   * 获取模型列表
   */
  async listModels(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    sort?: string;
  }): Promise<HFModel[]> {
    const response = await apiClient.get<{ data: HFModel[] }>("/models", {
      params,
    });
    return response.data.data;
  }

  /**
   * 获取模型详情
   */
  async getModel(modelId: string): Promise<HFModel> {
    const response = await apiClient.get<{ data: HFModel }>(
      `/models/${modelId}`,
    );
    return response.data.data;
  }

  /**
   * 文本推理
   */
  async textInference(
    modelId: string,
    inputs: string,
    parameters?: any,
  ): Promise<HFInferenceResponse> {
    const response = await apiClient.post<{ data: HFInferenceResponse }>(
      `/inference/text/${modelId}`,
      { inputs, parameters },
    );
    return response.data.data;
  }

  /**
   * 图像推理
   */
  async imageInference(
    modelId: string,
    inputs?: string,
    parameters?: any,
  ): Promise<HFInferenceResponse> {
    const response = await apiClient.post<{ data: HFInferenceResponse }>(
      `/inference/image/${modelId}`,
      { inputs, parameters },
    );
    return response.data.data;
  }

  /**
   * 音频推理
   */
  async audioInference(
    modelId: string,
    inputs?: string,
    parameters?: any,
  ): Promise<HFInferenceResponse> {
    const response = await apiClient.post<{ data: HFInferenceResponse }>(
      `/inference/audio/${modelId}`,
      { inputs, parameters },
    );
    return response.data.data;
  }
}

export const huggingFaceService = new HuggingFaceService();
