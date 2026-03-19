import apiClient from './api';
import type { TokenPayload } from '@/types/api';

export interface LoginResponse {
  user: TokenPayload;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: string;
}

export class AuthService {
  /**
   * 用户登录
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<{ data: LoginResponse }>('/auth/login', { email, password });
    return response.data.data;
  }

  /**
   * 刷新 token
   */
  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await apiClient.post<{ data: RefreshResponse }>('/auth/refresh', { refreshToken });
    return response.data.data;
  }

  /**
   * 登出
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * 获取 access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * 设置 tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
}

export const authService = new AuthService();
