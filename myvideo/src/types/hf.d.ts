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
export type { HFModel, HFInferenceResponse };
