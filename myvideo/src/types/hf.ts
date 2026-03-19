import type { HFModel, HFInferenceResponse } from './api';

export interface HuggingFaceState {
  models: HFModel[];
  loading: boolean;
  error: string | null;
  selectedModel: HFModel | null;
  inferenceResults: HFInferenceResponse[];
  inferenceLoading: boolean;
  inferenceError: string | null;
}

export interface UseHuggingFaceReturn {
  models: HFModel[];
  loading: boolean;
  error: string | null;
  selectedModel: HFModel | null;
  inferenceResults: HFInferenceResponse[];
  inferenceLoading: boolean;
  inferenceError: string | null;
  fetchModels: () => Promise<void>;
  selectModel: (model: HFModel) => void;
  runInference: (modelId: string, inputs: unknown, type: 'text' | 'image' | 'audio') => Promise<void>;
}

// 重新导出类型以便在其他地方使用
export type { HFModel, HFInferenceResponse };

