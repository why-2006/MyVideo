import type { HFModel, HFInferenceResponse } from '@/types/api';
export declare const useHfStore: import("pinia").StoreDefinition<"hf", Pick<{
    models: import("vue").Ref<{
        id: string;
        pipeline_tag: string;
        likes: number;
        downloads: number;
        tags: string[];
        library: string;
        model_type: string;
        sha: string;
        cardData: {
            language: string[];
            license: string;
            finetuned_from?: string | undefined;
            tasks?: string[] | undefined;
        };
    }[], HFModel[] | {
        id: string;
        pipeline_tag: string;
        likes: number;
        downloads: number;
        tags: string[];
        library: string;
        model_type: string;
        sha: string;
        cardData: {
            language: string[];
            license: string;
            finetuned_from?: string | undefined;
            tasks?: string[] | undefined;
        };
    }[]>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    selectedModel: import("vue").Ref<{
        id: string;
        pipeline_tag: string;
        likes: number;
        downloads: number;
        tags: string[];
        library: string;
        model_type: string;
        sha: string;
        cardData: {
            language: string[];
            license: string;
            finetuned_from?: string | undefined;
            tasks?: string[] | undefined;
        };
    } | null, HFModel | {
        id: string;
        pipeline_tag: string;
        likes: number;
        downloads: number;
        tags: string[];
        library: string;
        model_type: string;
        sha: string;
        cardData: {
            language: string[];
            license: string;
            finetuned_from?: string | undefined;
            tasks?: string[] | undefined;
        };
    } | null>;
    inferenceResults: import("vue").Ref<({
        generated_text?: string | undefined;
    } | {
        generated_image?: string | undefined;
    } | {
        generated_audio?: string | undefined;
    })[], HFInferenceResponse[] | ({
        generated_text?: string | undefined;
    } | {
        generated_image?: string | undefined;
    } | {
        generated_audio?: string | undefined;
    })[]>;
    inferenceLoading: import("vue").Ref<boolean, boolean>;
    inferenceError: import("vue").Ref<string | null, string | null>;
    fetchModels: () => Promise<void>;
    selectModel: (model: HFModel) => void;
    runInference: (modelId: string, inputs: unknown, type: "text" | "image" | "audio") => Promise<void>;
    clearInferenceResults: () => void;
    clearError: () => void;
}, "loading" | "error" | "models" | "selectedModel" | "inferenceResults" | "inferenceLoading" | "inferenceError">, Pick<{
    models: import("vue").Ref<{
        id: string;
        pipeline_tag: string;
        likes: number;
        downloads: number;
        tags: string[];
        library: string;
        model_type: string;
        sha: string;
        cardData: {
            language: string[];
            license: string;
            finetuned_from?: string | undefined;
            tasks?: string[] | undefined;
        };
    }[], HFModel[] | {
        id: string;
        pipeline_tag: string;
        likes: number;
        downloads: number;
        tags: string[];
        library: string;
        model_type: string;
        sha: string;
        cardData: {
            language: string[];
            license: string;
            finetuned_from?: string | undefined;
            tasks?: string[] | undefined;
        };
    }[]>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    selectedModel: import("vue").Ref<{
        id: string;
        pipeline_tag: string;
        likes: number;
        downloads: number;
        tags: string[];
        library: string;
        model_type: string;
        sha: string;
        cardData: {
            language: string[];
            license: string;
            finetuned_from?: string | undefined;
            tasks?: string[] | undefined;
        };
    } | null, HFModel | {
        id: string;
        pipeline_tag: string;
        likes: number;
        downloads: number;
        tags: string[];
        library: string;
        model_type: string;
        sha: string;
        cardData: {
            language: string[];
            license: string;
            finetuned_from?: string | undefined;
            tasks?: string[] | undefined;
        };
    } | null>;
    inferenceResults: import("vue").Ref<({
        generated_text?: string | undefined;
    } | {
        generated_image?: string | undefined;
    } | {
        generated_audio?: string | undefined;
    })[], HFInferenceResponse[] | ({
        generated_text?: string | undefined;
    } | {
        generated_image?: string | undefined;
    } | {
        generated_audio?: string | undefined;
    })[]>;
    inferenceLoading: import("vue").Ref<boolean, boolean>;
    inferenceError: import("vue").Ref<string | null, string | null>;
    fetchModels: () => Promise<void>;
    selectModel: (model: HFModel) => void;
    runInference: (modelId: string, inputs: unknown, type: "text" | "image" | "audio") => Promise<void>;
    clearInferenceResults: () => void;
    clearError: () => void;
}, never>, Pick<{
    models: import("vue").Ref<{
        id: string;
        pipeline_tag: string;
        likes: number;
        downloads: number;
        tags: string[];
        library: string;
        model_type: string;
        sha: string;
        cardData: {
            language: string[];
            license: string;
            finetuned_from?: string | undefined;
            tasks?: string[] | undefined;
        };
    }[], HFModel[] | {
        id: string;
        pipeline_tag: string;
        likes: number;
        downloads: number;
        tags: string[];
        library: string;
        model_type: string;
        sha: string;
        cardData: {
            language: string[];
            license: string;
            finetuned_from?: string | undefined;
            tasks?: string[] | undefined;
        };
    }[]>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    selectedModel: import("vue").Ref<{
        id: string;
        pipeline_tag: string;
        likes: number;
        downloads: number;
        tags: string[];
        library: string;
        model_type: string;
        sha: string;
        cardData: {
            language: string[];
            license: string;
            finetuned_from?: string | undefined;
            tasks?: string[] | undefined;
        };
    } | null, HFModel | {
        id: string;
        pipeline_tag: string;
        likes: number;
        downloads: number;
        tags: string[];
        library: string;
        model_type: string;
        sha: string;
        cardData: {
            language: string[];
            license: string;
            finetuned_from?: string | undefined;
            tasks?: string[] | undefined;
        };
    } | null>;
    inferenceResults: import("vue").Ref<({
        generated_text?: string | undefined;
    } | {
        generated_image?: string | undefined;
    } | {
        generated_audio?: string | undefined;
    })[], HFInferenceResponse[] | ({
        generated_text?: string | undefined;
    } | {
        generated_image?: string | undefined;
    } | {
        generated_audio?: string | undefined;
    })[]>;
    inferenceLoading: import("vue").Ref<boolean, boolean>;
    inferenceError: import("vue").Ref<string | null, string | null>;
    fetchModels: () => Promise<void>;
    selectModel: (model: HFModel) => void;
    runInference: (modelId: string, inputs: unknown, type: "text" | "image" | "audio") => Promise<void>;
    clearInferenceResults: () => void;
    clearError: () => void;
}, "fetchModels" | "selectModel" | "runInference" | "clearInferenceResults" | "clearError">>;
