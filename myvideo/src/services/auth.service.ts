import axios from "axios";
import type { AuthService, AuthResponse, TokenPayload } from "@/types/api";

export const authService: AuthService = {
  async login(email: string, password: string) {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      const { access_token, refresh_token, user } = response.data;
      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        } as TokenPayload,
      } as AuthResponse;
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  async register(email: string, password: string, username: string, name: string) {
    try {
      const response = await axios.post("/api/auth/register", {
        email,
        password,
        username,
        name,
      });

      const { access_token, refresh_token, user } = response.data;
      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        } as TokenPayload,
      } as AuthResponse;
    } catch (error: any) {
      console.error("Register failed:", error);
      throw new Error(error.response?.data?.message || "Register failed");
    }
  },

  logout() {
    axios.post("/api/auth/logout");
  },

  async refreshToken() {
    try {
      const response = await axios.post("/api/auth/refresh");
      return response.data.access_token;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Token refresh failed");
    }
  },
};
