import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  HFModel,
  HFInferenceResponse,
  HFTaskInput,
  HFTaskResponse,
} from "@/types/api";
import { huggingFaceService } from "@/services/hf.service";

export const useHfStore = defineStore("hf", () => {
  // State
  const models = ref<HFModel[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedModel = ref<HFModel | null>(null);
  const inferenceResults = ref<HFInferenceResponse[]>([]);
  const inferenceLoading = ref(false);
  const inferenceError = ref<string | null>(null);
  const currentInferenceType = ref<"text" | "image" | "audio" | null>(null);
  const taskLoading = ref(false);
  const taskError = ref<string | null>(null);
  const taskResult = ref<HFTaskResponse | null>(null);
  //同步选中模型与当前模型列表，确保选中的模型在新列表中仍然存在，否则重置为第一个模型或null
  const syncSelectedModel = (nextModels: HFModel[]) => {
    if (nextModels.length === 0) {
      selectedModel.value = null;
      return;
    }

    const currentId = selectedModel.value?.id;
    const existsInCurrentList =
      !!currentId && nextModels.some((model) => model.id === currentId);

    if (!existsInCurrentList) {
      selectedModel.value = nextModels[0];
    }
  };

  // Actions
  const fetchModels = async () => {
    loading.value = true;
    error.value = null;
    try {
      models.value = await huggingFaceService.listModels({ limit: 10 });
    } catch (err: any) {
      error.value = err.message || "Failed to fetch models";
      console.error("Failed to fetch models:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchTextModels = async () => {
    loading.value = true;
    error.value = null;
    //如果当前不是文本模型，切换类型时清空之前的推理结果
    try {
      if (currentInferenceType.value !== "text") {
        inferenceResults.value = [];
      }
      currentInferenceType.value = "text";
      models.value = await huggingFaceService.listTextModels({ limit: 10 });
      syncSelectedModel(models.value);
    } catch (err: any) {
      error.value = err.message || "Failed to fetch text models";
      console.error("Failed to fetch text models:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchAudioModels = async () => {
    loading.value = true;
    error.value = null;
    try {
      if (currentInferenceType.value !== "audio") {
        inferenceResults.value = [];
      }
      currentInferenceType.value = "audio";
      models.value = await huggingFaceService.listAudioModels({ limit: 10 });
      syncSelectedModel(models.value);
    } catch (err: any) {
      error.value = err.message || "Failed to fetch audio models";
      console.error("Failed to fetch audio models:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchImageModels = async () => {
    loading.value = true;
    error.value = null;
    try {
      if (currentInferenceType.value !== "image") {
        inferenceResults.value = [];
      }
      currentInferenceType.value = "image";
      models.value = await huggingFaceService.listImageModels({ limit: 10 });
      syncSelectedModel(models.value);
    } catch (err: any) {
      error.value = err.message || "Failed to fetch image models";
      console.error("Failed to fetch image models:", err);
    } finally {
      loading.value = false;
    }
  };

  const selectModel = (model: HFModel) => {
    selectedModel.value = model;
  };
  //根据模型类型运行推理，并处理不同类型的输入和输出，确保结果与当前模型类型一致
  const runInference = async (
    modelId: string,
    inputs: unknown,
    type: "text" | "image" | "audio",
  ) => {
    inferenceLoading.value = true;
    inferenceError.value = null;
    //清除之前的推理结果，如果切换了模型类型，确保结果与当前类型一致
    try {
      if (currentInferenceType.value !== type) {
        inferenceResults.value = [];
      }
      currentInferenceType.value = type;

      let result: HFInferenceResponse;
      switch (type) {
        case "text":
          result = await huggingFaceService.textInference(
            modelId,
            inputs as string,
          );
          break;
        case "image":
          result = await huggingFaceService.imageInference(
            modelId,
            inputs as string | File,
          );
          break;
        case "audio":
          result = await huggingFaceService.audioInference(
            modelId,
            inputs as string | File,
          );
          break;
        default:
          throw new Error("Invalid inference type");
      }

      if (type === "image") {
        // 对于图像模型，直接替换之前的结果
        inferenceResults.value = [result];
      } else {
        // 对于文本和音频模型，保留之前的结果并将新结果添加到前面，最多保留10条
        inferenceResults.value = [result, ...inferenceResults.value].slice(
          0,
          10,
        );
      }
    } catch (err: any) {
      inferenceError.value = err.message || "Failed to run inference";
      console.error("Failed to run inference:", err);
    } finally {
      inferenceLoading.value = false;
    }
  };

  const clearInferenceResults = () => {
    inferenceResults.value = [];
    currentInferenceType.value = null;
  };

  const runMultimodalTask = async (inputs: HFTaskInput) => {
    taskLoading.value = true;
    taskError.value = null;
    try {
      taskResult.value =
        await huggingFaceService.multimodalTaskInference(inputs);
    } catch (err: any) {
      taskError.value = err.message || "Failed to run multimodal task";
      console.error("Failed to run multimodal task:", err);
    } finally {
      taskLoading.value = false;
    }
  };

  const clearTaskResult = () => {
    taskResult.value = null;
    taskError.value = null;
  };

  const clearError = () => {
    error.value = null;
    inferenceError.value = null;
    taskError.value = null;
  };

  return {
    models,
    loading,
    error,
    selectedModel,
    inferenceResults,
    inferenceLoading,
    inferenceError,
    taskLoading,
    taskError,
    taskResult,
    fetchModels,
    fetchTextModels,
    fetchAudioModels,
    fetchImageModels,
    selectModel,
    runInference,
    runMultimodalTask,
    clearInferenceResults,
    clearTaskResult,
    clearError,
  };
});
