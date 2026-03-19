// Hugging Face API 类型定义

export interface HFModel {
  id: string;
  pipeline_tag: string;
  likes: number;
  downloads: number;
  tags: string[];
  library: string;
  model_type: string;
  sha: string;
  cardData: ModelCard;
}

export interface ModelCard {
  language: string[];
  license: string;
  finetuned_from?: string;
  tasks?: string[];
}

export interface HFTextInferenceResponse {
  generated_text?: string;
}

export interface HFImageInferenceResponse {
  generated_image?: string;
}

export interface HFAudioInferenceResponse {
  generated_audio?: string;
}

export type HFInferenceResponse = HFTextInferenceResponse | HFImageInferenceResponse | HFAudioInferenceResponse;

export interface HFInferenceParams {
  max_new_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  do_sample?: boolean;
  repetition_penalty?: number;
}

export interface ListModelsParams {
  limit?: number;
  offset?: number;
  search?: string;
  sort?: string;
}

export interface Pagination {
  has_next: boolean;
  has_previous: boolean;
  next: string | null;
  previous: string | null;
  count: number;
}

export interface HFClientError {
  message: string;
  type: string;
  details?: unknown;
}

export interface HFError {
  error: string;
  detail?: string;
}
