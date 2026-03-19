// API 相关类型定义

export interface TokenPayload {
  userId: string;
  email: string;
  name?: string;
}

export interface User {
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: TokenPayload;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: string;
}

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
