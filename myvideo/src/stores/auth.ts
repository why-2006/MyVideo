import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { TokenPayload } from "@/types/api";
import { authService } from "@/services/auth.service";

export const useAuthStore = defineStore("auth", () => {
  // State
  const accessToken = ref<string | null>(localStorage.getItem("access_token"));
  const refreshToken = ref<string | null>(
    localStorage.getItem("refresh_token"),
  );
  const user = ref<TokenPayload | null>(null);
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
  };

  const clearAuth = () => {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

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

  const register = async (email: string, password: string, username: string, name: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.register(email, password, username, name);
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
    clearAuth,
    login,
    register,
    logout,
  };
});
