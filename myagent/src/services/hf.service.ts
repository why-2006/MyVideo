import apiClient from "@/services/api";
import type {
  HuggingFaceService,
  HFModel,
  HFInferenceResponse,
  HFTaskInput,
  HFTaskResponse,
} from "@/types/api";

const TEXT_MODEL: HFModel = {
  id: "katanemo/Arch-Router-1.5B:hf-inference",
  model_type: "causal-lm",
  pipeline_tag: "text-generation",
  downloads: 0,
  likes: 0,
};

const AUDIO_MODEL: HFModel = {
  id: "openai/whisper-large-v3",
  model_type: "automatic-speech-recognition",
  pipeline_tag: "automatic-speech-recognition",
  downloads: 0,
  likes: 0,
};

const IMAGE_MODEL: HFModel = {
  id: "google/vit-base-patch16-224",
  model_type: "image-classification",
  pipeline_tag: "image-classification",
  downloads: 0,
  likes: 0,
};

const STATIC_MODELS: HFModel[] = [TEXT_MODEL, AUDIO_MODEL, IMAGE_MODEL];

export const huggingFaceService: HuggingFaceService = {
  async listModels() {
    return STATIC_MODELS;
  },

  async listTextModels() {
    return [TEXT_MODEL];
  },

  async listAudioModels() {
    return [AUDIO_MODEL];
  },

  async listImageModels() {
    return [IMAGE_MODEL];
  },

  async textInference(modelId: string, inputs: string) {
    try {
      const response = await apiClient.post(
        `/inference/text/${encodeURIComponent(modelId)}`,
        {
          inputs,
        },
      );

      return (response.data.data ?? response.data) as HFInferenceResponse;
    } catch (error) {
      console.error("Text inference failed:", error);
      throw new Error("Failed to run text inference");
    }
  },

  async imageInference(modelId: string, inputs: string | File) {
    try {
      const url = `/inference/image/${encodeURIComponent(modelId)}`;
      const response =
        inputs instanceof File
          ? await apiClient.post(
              url,
              (() => {
                const formData = new FormData();
                formData.append("file", inputs);
                return formData;
              })(),
            )
          : await apiClient.post(url, { inputs });

      return (response.data.data ?? response.data) as HFInferenceResponse;
    } catch (error) {
      console.error("Image inference failed:", error);
      throw new Error("Failed to run image inference");
    }
  },

  async audioInference(modelId: string, inputs: string | File) {
    try {
      const url = `/inference/audio/${encodeURIComponent(modelId)}`;
      const response =
        inputs instanceof File
          ? await apiClient.post(
              url,
              (() => {
                const formData = new FormData();
                formData.append("file", inputs);
                return formData;
              })(),
            )
          : await apiClient.post(url, { inputs });

      return (response.data.data ?? response.data) as HFInferenceResponse;
    } catch (error) {
      console.error("Audio inference failed:", error);
      throw new Error("Failed to run audio inference");
    }
  },

  async multimodalTaskInference(inputs: HFTaskInput): Promise<HFTaskResponse> {
    try {
      const formData = new FormData();

      if (inputs.text && inputs.text.trim()) {
        formData.append("text", inputs.text.trim());
      }

      if (inputs.imageFile) {
        formData.append("image", inputs.imageFile);
      }

      if (inputs.audioFile) {
        formData.append("audio", inputs.audioFile);
      }

      const response = await apiClient.post(
        "/tasks/multimodal-summary",
        formData,
      );
      return (response.data.data ?? response.data) as HFTaskResponse;
    } catch (error) {
      console.error("Multimodal task inference failed:", error);
      throw new Error("Failed to run multimodal task inference");
    }
  },
};
