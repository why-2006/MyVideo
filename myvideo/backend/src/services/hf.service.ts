import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import type {
  HFModel,
  HFInferenceResponse,
  HFTextInferenceResponse,
  HFImageInferenceResponse,
  HFAudioInferenceResponse,
  ListModelsParams,
  HFClientError,
} from '../types/hf';

const DEFAULT_TIMEOUT = 60000; // 60秒
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export class HuggingFaceService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.huggingFace.apiUrl,
      headers: {
        Authorization: `Bearer ${config.huggingFace.apiKey}`,
      },
      timeout: DEFAULT_TIMEOUT,
    });

    // 错误处理
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        return this.handleAxiosError(error);
      }
    );
  }

  private async handleAxiosError(error: any): Promise<never> {
    if (error.response) {
      // 服务器返回错误响应
      const { status, data } = error.response;
      throw new Error(data.error || data.detail || `HTTP ${status}: ${error.message}`);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      throw new Error('Network error: No response received from server');
    } else {
      // 请求配置错误
      throw new Error(error.message || 'Unknown error occurred');
    }
  }

  private async fetchWithRetry<T>(
    url: string,
    method: 'GET' | 'POST',
    data?: any,
    retries = MAX_RETRIES
  ): Promise<T> {
    try {
      const config: any = {
        method,
        headers: {},
      };

      if (data) {
        config.data = data;
      }

      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (MAX_RETRIES - retries + 1)));
        return this.fetchWithRetry<T>(url, method, data, retries - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    if (error.message && error.message.includes('503')) {
      return true; // Model loading error
    }
    return false;
  }

  /**
   * 列出模型
   */
  async listModels(params?: ListModelsParams): Promise<HFModel[]> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);

    const url = `/models?${queryParams.toString()}`;
    const data = await this.fetchWithRetry<HFModel[]>(url, 'GET');

    return Array.isArray(data) ? data : [data];
  }

  /**
   * 获取模型详情
   */
  async getModel(modelId: string): Promise<HFModel> {
    const url = `/models/${modelId}`;
    const data = await this.fetchWithRetry<HFModel>(url, 'GET');
    return data;
  }

  /**
   * 文本推理
   */
  async textInference(
    modelId: string,
    inputs: string,
    parameters?: any
  ): Promise<HFTextInferenceResponse> {
    const url = `/${modelId}`;
    const data = await this.fetchWithRetry<HFTextInferenceResponse>(url, 'POST', { inputs, parameters });
    return data;
  }

  /**
   * 图像推理
   */
  async imageInference(
    modelId: string,
    inputs?: string,
    parameters?: any
  ): Promise<HFImageInferenceResponse> {
    const url = `/${modelId}`;
    const data = await this.fetchWithRetry<HFImageInferenceResponse>(url, 'POST', { inputs, parameters });
    return data;
  }

  /**
   * 音频推理
   */
  async audioInference(
    modelId: string,
    inputs?: string,
    parameters?: any
  ): Promise<HFAudioInferenceResponse> {
    const url = `/${modelId}`;
    const data = await this.fetchWithRetry<HFAudioInferenceResponse>(url, 'POST', { inputs, parameters });
    return data;
  }
}

// 导出单例
export const huggingFaceService = new HuggingFaceService();
