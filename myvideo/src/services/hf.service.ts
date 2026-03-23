import axios from "axios";
import type {
  HuggingFaceService,
  HFModel,
  HFInferenceResponse,
} from "@/types/api";

export const huggingFaceService: HuggingFaceService = {
  async listModels(params = { limit: 10 }) {
    try {
      const response = await axios.get("https://huggingface.co/api/models", {
        params: {
          limit: params.limit,
          sort: "downloads",
        },
      });

      return response.data.map((model: any) => ({
        id: model.id,
        model_type: model.model_type,
        pipeline_tag: model.pipeline_tag,
        downloads: model.downloads,
        likes: model.likes,
      })) as HFModel[];
    } catch (error) {
      console.error("Failed to fetch models:", error);
      throw new Error("Failed to fetch models from Hugging Face");
    }
  },

  async textInference(modelId: string, inputs: string) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${modelId}`,
        { inputs },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data as HFInferenceResponse;
    } catch (error) {
      console.error("Text inference failed:", error);
      throw new Error("Failed to run text inference");
    }
  },

  async imageInference(modelId: string, inputs: string) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${modelId}`,
        { inputs },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data as HFInferenceResponse;
    } catch (error) {
      console.error("Image inference failed:", error);
      throw new Error("Failed to run image inference");
    }
  },

  async audioInference(modelId: string, inputs: string) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${modelId}`,
        { inputs },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data as HFInferenceResponse;
    } catch (error) {
      console.error("Audio inference failed:", error);
      throw new Error("Failed to run audio inference");
    }
  },
};
