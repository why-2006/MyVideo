export interface TokenPayload {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: TokenPayload;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface HFModel {
  id: string;
  model_type?: string;
  pipeline_tag?: string;
  downloads?: number;
  likes?: number;
}

export interface HFInferenceResponse {
  generated_text?: string;
  [key: string]: any;
}

export interface HuggingFaceService {
  listModels: (params?: { limit?: number }) => Promise<HFModel[]>;
  listTextModels: (params?: { limit?: number }) => Promise<HFModel[]>;
  listAudioModels: (params?: { limit?: number }) => Promise<HFModel[]>;
  listImageModels: (params?: { limit?: number }) => Promise<HFModel[]>;
  textInference: (
    modelId: string,
    inputs: string,
  ) => Promise<HFInferenceResponse>;
  imageInference: (
    modelId: string,
    inputs: string | File,
  ) => Promise<HFInferenceResponse>;
  audioInference: (
    modelId: string,
    inputs: string | File,
  ) => Promise<HFInferenceResponse>;
}

export interface AuthService {
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<AuthResponse>;
  logout: () => void;
  refreshToken: () => Promise<string>;
}
