import axios from "axios";
import https from "https";
import type { AxiosProxyConfig } from "axios";
import { config } from "../config";
import type {
  HFModel,
  HFInferenceResponse,
  HFTextInferenceResponse,
  HFImageInferenceResponse,
  HFAudioInferenceResponse,
} from "../types/hf";

const TEXT_MODEL: HFModel = {
  id: "katanemo/Arch-Router-1.5B:hf-inference",
  model_type: "causal-lm",
  pipeline_tag: "text-generation",
  likes: 0,
  downloads: 0,
  tags: [],
  library: "",
  sha: "",
  cardData: {
    language: ["en"],
    license: "",
  },
};

const AUDIO_MODEL: HFModel = {
  id: "openai/whisper-large-v3",
  model_type: "automatic-speech-recognition",
  pipeline_tag: "automatic-speech-recognition",
  likes: 0,
  downloads: 0,
  tags: [],
  library: "",
  sha: "",
  cardData: {
    language: ["en"],
    license: "",
  },
};

const IMAGE_MODEL: HFModel = {
  id: "google/vit-base-patch16-224",
  model_type: "image-classification",
  pipeline_tag: "image-classification",
  likes: 0,
  downloads: 0,
  tags: [],
  library: "",
  sha: "",
  cardData: {
    language: ["en"],
    license: "",
  },
};

const STATIC_MODELS: HFModel[] = [TEXT_MODEL, AUDIO_MODEL, IMAGE_MODEL];

const SUPPORTED_MODEL_IDS = new Set(STATIC_MODELS.map((model) => model.id));

export class HuggingFaceService {
  private readonly httpsAgent = new https.Agent({ family: 4, keepAlive: true });

  private shouldBypassProxy(hostname: string): boolean {
    if (!config.huggingFace.noProxy.trim()) {
      return false;
    }

    const rules = config.huggingFace.noProxy
      .split(",")
      .map((rule) => rule.trim().toLowerCase())
      .filter(Boolean);

    const host = hostname.toLowerCase();
    return rules.some((rule) => {
      if (rule === "*") {
        return true;
      }
      if (rule.startsWith(".")) {
        return host.endsWith(rule);
      }
      return host === rule || host.endsWith(`.${rule}`);
    });
  }

  private resolveProxy(endpoint: string): AxiosProxyConfig | false | undefined {
    const proxyUrl = config.huggingFace.proxyUrl.trim();
    if (!proxyUrl) {
      return undefined;
    }

    const targetHost = new URL(endpoint).hostname;
    if (this.shouldBypassProxy(targetHost)) {
      return false;
    }

    const parsed = new URL(proxyUrl);
    const protocol = parsed.protocol.replace(":", "").toLowerCase();

    return {
      protocol,
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : protocol === "https" ? 443 : 80,
      auth: parsed.username
        ? {
            username: decodeURIComponent(parsed.username),
            password: decodeURIComponent(parsed.password),
          }
        : undefined,
    };
  }

  constructor() {
    this.ensureApiKey();
  }

  private handleInferenceError(error: any): never {
    const timeoutMessage =
      error?.code === "ETIMEDOUT" || error?.code === "ECONNABORTED"
        ? `Connection to ${config.huggingFace.apiUrl} timed out`
        : undefined;
    const responseMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.response?.statusText;
    const message =
      timeoutMessage ||
      responseMessage ||
      error?.message ||
      error?.details?.message ||
      "Hugging Face inference request failed";
    const err = new Error(message);
    (err as any).statusCode =
      error?.response?.status || error?.statusCode || 502;
    throw err;
  }

  private ensureApiKey(): void {
    if (!config.huggingFace.apiKey || !config.huggingFace.apiKey.trim()) {
      throw new Error(
        "Missing Hugging Face API token. Set HF_API_TOKEN in backend/.env",
      );
    }
  }

  private decodeBinaryInput(
    input: string | ArrayBuffer | Blob | Buffer | undefined,
    explicitContentType?: string,
  ): {
    buffer: Buffer;
    contentType?: string;
  } {
    if (!input) {
      throw new Error("Binary input is required");
    }

    if (typeof input === "string") {
      const contentTypeMatch = input.match(/^data:([^;]+);base64,/i);
      const contentType = contentTypeMatch?.[1];
      const base64 = input.includes(",") ? input.split(",")[1] : input;
      const buffer = Buffer.from(base64, "base64");
      return { buffer, contentType: explicitContentType || contentType };
    }

    if (input instanceof ArrayBuffer) {
      return {
        buffer: Buffer.from(input),
        contentType: explicitContentType,
      };
    }

    if (Buffer.isBuffer(input)) {
      return {
        buffer: input,
        contentType: explicitContentType,
      };
    }

    throw new Error("Unsupported binary input type");
  }

  private assertValidModelId(modelId: string): void {
    if (!SUPPORTED_MODEL_IDS.has(modelId)) {
      const error = new Error(`Unsupported modelId: ${modelId}`);
      (error as any).statusCode = 400;
      throw error;
    }
  }

  private async chatCompletion(
    modelId: string,
    userInput: string,
    parameters?: Record<string, unknown>,
  ): Promise<string> {
    const endpoint = `${config.huggingFace.apiUrl.replace(/\/$/, "")}/v1/chat/completions`;
    const proxy = this.resolveProxy(endpoint);
    const payload: Record<string, unknown> = {
      model: modelId,
      messages: [{ role: "user", content: userInput }],
      stream: false,
    };

    if (parameters && Object.keys(parameters).length > 0) {
      Object.assign(payload, parameters);
    }

    const response = await axios.post(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${config.huggingFace.apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      httpsAgent: proxy === undefined ? this.httpsAgent : undefined,
      proxy,
      timeout: 60000,
    });

    const content = response?.data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error(
        "Invalid chat completion response from Hugging Face Router",
      );
    }

    return content;
  }

  private async modelBinaryInference<T>(
    modelId: string,
    binaryInput: string | ArrayBuffer | Blob | Buffer | undefined,
    explicitContentType?: string,
  ): Promise<T> {
    const endpoint = `${config.huggingFace.apiUrl.replace(/\/$/, "")}/hf-inference/models/${encodeURIComponent(modelId)}`;
    const proxy = this.resolveProxy(endpoint);
    const { buffer, contentType } = this.decodeBinaryInput(
      binaryInput,
      explicitContentType,
    );

    const response = await axios.post(endpoint, buffer, {
      headers: {
        Authorization: `Bearer ${config.huggingFace.apiKey}`,
        Accept: "application/json",
        "Content-Type": contentType || "application/octet-stream",
      },
      httpsAgent: proxy === undefined ? this.httpsAgent : undefined,
      proxy,
      timeout: 60000,
    });

    return response.data as T;
  }

  /**
   * 列出模型
   */
  async listModels(): Promise<HFModel[]> {
    return STATIC_MODELS;
  }

  /**
   * 获取模型详情
   */
  async getModel(modelId: string): Promise<HFModel> {
    const model = STATIC_MODELS.find((item) => item.id === modelId);

    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    return model;
  }

  /**
   * 文本推理
   */
  async textInference(
    modelId: string,
    inputs: string,
    parameters?: any,
  ): Promise<HFTextInferenceResponse> {
    try {
      this.assertValidModelId(modelId);
      const generatedText = await this.chatCompletion(
        modelId,
        inputs,
        parameters,
      );

      return {
        generated_text: generatedText,
      };
    } catch (error) {
      this.handleInferenceError(error);
    }
  }

  /**
   * 图像推理
   */
  async imageInference(
    modelId: string,
    inputs?: string | ArrayBuffer | Blob | Buffer,
    parameters?: any,
    contentType?: string,
  ): Promise<HFImageInferenceResponse> {
    try {
      this.assertValidModelId(modelId);
      const response = await this.modelBinaryInference<any>(
        modelId,
        inputs,
        contentType,
      );

      if (Array.isArray(response)) {
        return {
          generated_image: JSON.stringify(response),
        };
      }

      return {
        generated_image: (response as any).label || JSON.stringify(response),
      };
    } catch (error) {
      this.handleInferenceError(error);
    }
  }

  /**
   * 音频推理
   */
  async audioInference(
    modelId: string,
    inputs?: string | ArrayBuffer | Blob | Buffer,
    parameters?: any,
    contentType?: string,
  ): Promise<HFAudioInferenceResponse> {
    try {
      this.assertValidModelId(modelId);
      const response = await this.modelBinaryInference<any>(
        modelId,
        inputs,
        contentType,
      );

      return {
        generated_audio:
          typeof response === "object"
            ? (response as any).text || JSON.stringify(response)
            : String(response),
      };
    } catch (error) {
      this.handleInferenceError(error);
    }
  }
}

// 导出单例
export const huggingFaceService = new HuggingFaceService();
