import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { TokenPayload } from "@/types/api";
import { authService } from "@/services/auth.service";
//解码JWT 将token的payload部分解析为字符串，提取用户信息
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }
    //将url安全的Base64字符串转换为标准Base64格式
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    //解码Base64字符串并解析为JSON对象
    const decoded = atob(normalized);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}
//从localStorage读取用户信息，解析为TokenPayload对象，如果解析失败则返回null
function readStoredUser(): TokenPayload | null {
  const raw = localStorage.getItem("user_profile");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TokenPayload;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  // State
  const accessToken = ref<string | null>(localStorage.getItem("access_token"));
  const refreshToken = ref<string | null>(
    localStorage.getItem("refresh_token"),
  );
  const user = ref<TokenPayload | null>(readStoredUser());
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value);
  const isTokenValid = computed(() => !!accessToken.value && !!user.value);

  // Actions
  const setTokens = (newAccessToken: string, newRefreshToken: string) => {
    accessToken.value = newAccessToken;
    refreshToken.value = newRefreshToken;
    localStorage.setItem("access_token", newAccessToken);
    localStorage.setItem("refresh_token", newRefreshToken);
  };

  const setUser = (userData: TokenPayload) => {
    user.value = userData;
    localStorage.setItem("user_profile", JSON.stringify(userData));
  };

  const updateUser = (updates: Partial<TokenPayload>) => {
    if (user.value) {
      user.value = { ...user.value, ...updates };
    }
  };

  const clearAuth = () => {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_profile");
  };
  //应用启动时尝试从现有 access token 中恢复用户信息，以支持页面刷新后保持登录状态
  if (!user.value && accessToken.value) {
    const payload = decodeJwtPayload(accessToken.value);
    if (payload && typeof payload.email === "string") {
      const restoredUser: TokenPayload = {
        id:
          typeof payload.userId === "string"
            ? payload.userId
            : typeof payload.id === "string"
              ? payload.id
              : "",
        email: payload.email,
        name: typeof payload.name === "string" ? payload.name : payload.email,
      };

      if (restoredUser.id) {
        setUser(restoredUser);
      }
    }
  }

  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.login(email, password);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      return true;
    } catch (err: any) {
      error.value = err.message || "Login failed";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.register(email, password, name);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      return true;
    } catch (err: any) {
      error.value = err.message || "Register failed";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    clearAuth();
  };

  return {
    accessToken,
    refreshToken,
    user,
    loading,
    error,
    isAuthenticated,
    isTokenValid,
    setTokens,
    setUser,
    updateUser,
    clearAuth,
    login,
    register,
    logout,
  };
});
