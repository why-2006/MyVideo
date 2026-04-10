import apiClient from "@/services/api";
import type { AuthService, AuthResponse, TokenPayload } from "@/types/api";

export const authService: AuthService = {
  //获取access token和refresh token，并解析用户信息
  async login(email: string, password: string) {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const payload = response.data.data ?? response.data;
      const { access_token, refresh_token, accessToken, refreshToken, user } =
        payload;
      return {
        accessToken: access_token || accessToken,
        refreshToken: refresh_token || refreshToken,
        user: {
          id: user.id || user.userId,
          email: user.email,
          name: user.name,
        } as TokenPayload,
      } as AuthResponse;
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  async register(email: string, password: string, name: string) {
    try {
      const response = await apiClient.post("/auth/register", {
        email,
        password,
        name,
      });

      const payload = response.data.data ?? response.data;
      const { access_token, refresh_token, accessToken, refreshToken, user } =
        payload;
      return {
        accessToken: access_token || accessToken,
        refreshToken: refresh_token || refreshToken,
        user: {
          id: user.id || user.userId,
          email: user.email,
          name: user.name,
        } as TokenPayload,
      } as AuthResponse;
    } catch (error: any) {
      console.error("Register failed:", error);
      throw new Error(error.response?.data?.message || "Register failed");
    }
  },

  logout() {
    apiClient.post("/auth/logout");
  },
};
