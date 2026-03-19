import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { HFModel, HFInferenceResponse } from '@/types/api';
import { huggingFaceService } from '@/services/hf.service';

export const useHfStore = defineStore('hf', () => {
  // State
  const models = ref<HFModel[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedModel = ref<HFModel | null>(null);
  const inferenceResults = ref<HFInferenceResponse[]>([]);
  const inferenceLoading = ref(false);
  const inferenceError = ref<string | null>(null);

  // Actions
  const fetchModels = async () => {
    loading.value = true;
    error.value = null;
    try {
      models.value = await huggingFaceService.listModels({ limit: 10 });
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch models';
      console.error('Failed to fetch models:', err);
    } finally {
      loading.value = false;
    }
  };

  const selectModel = (model: HFModel) => {
    selectedModel.value = model;
  };

  const runInference = async (
    modelId: string,
    inputs: unknown,
    type: 'text' | 'image' | 'audio'
  ) => {
    inferenceLoading.value = true;
    inferenceError.value = null;
    try {
      let result: HFInferenceResponse;
      switch (type) {
        case 'text':
          result = await huggingFaceService.textInference(modelId, inputs as string);
          break;
        case 'image':
          result = await huggingFaceService.imageInference(modelId, inputs as string);
          break;
        case 'audio':
          result = await huggingFaceService.audioInference(modelId, inputs as string);
          break;
        default:
          throw new Error('Invalid inference type');
      }

      // Add result to the beginning of array and keep only last 10
      inferenceResults.value = [result, ...inferenceResults.value].slice(0, 10);
    } catch (err: any) {
      inferenceError.value = err.message || 'Failed to run inference';
      console.error('Failed to run inference:', err);
    } finally {
      inferenceLoading.value = false;
    }
  };

  const clearInferenceResults = () => {
    inferenceResults.value = [];
  };

  const clearError = () => {
    error.value = null;
    inferenceError.value = null;
  };

  return {
    models,
    loading,
    error,
    selectedModel,
    inferenceResults,
    inferenceLoading,
    inferenceError,
    fetchModels,
    selectModel,
    runInference,
    clearInferenceResults,
    clearError,
  };
});
