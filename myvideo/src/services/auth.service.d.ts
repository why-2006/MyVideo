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
export declare class AuthService {
    /**
     * 用户登录
     */
    login(email: string, password: string): Promise<LoginResponse>;
    /**
     * 刷新 token
     */
    refresh(refreshToken: string): Promise<RefreshResponse>;
    /**
     * 登出
     */
    logout(): void;
    /**
     * 检查是否已登录
     */
    isAuthenticated(): boolean;
    /**
     * 获取 access token
     */
    getAccessToken(): string | null;
    /**
     * 设置 tokens
     */
    setTokens(accessToken: string, refreshToken: string): void;
}
export declare const authService: AuthService;
