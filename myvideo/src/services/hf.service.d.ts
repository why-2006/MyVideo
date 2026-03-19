import type { HFModel, HFInferenceResponse } from "@/types/api";
export declare class HuggingFaceService {
    /**
     * 获取模型列表
     */
    listModels(params?: {
        limit?: number;
        offset?: number;
        search?: string;
        sort?: string;
    }): Promise<HFModel[]>;
    /**
     * 获取模型详情
     */
    getModel(modelId: string): Promise<HFModel>;
    /**
     * 文本推理
     */
    textInference(modelId: string, inputs: string, parameters?: any): Promise<HFInferenceResponse>;
    /**
     * 图像推理
     */
    imageInference(modelId: string, inputs?: string, parameters?: any): Promise<HFInferenceResponse>;
    /**
     * 音频推理
     */
    audioInference(modelId: string, inputs?: string, parameters?: any): Promise<HFInferenceResponse>;
}
export declare const huggingFaceService: HuggingFaceService;
