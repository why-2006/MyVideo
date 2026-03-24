import axios, { type AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
  timeout: 60000,
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器 - 处理 token 刷新
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && error.config) {
      (error.config as any)._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          // 没有 refresh token，跳转到登录页
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/auth/refresh`,
          {
            refreshToken,
          },
        );

        const data = response.data.data as { accessToken: string };
        const { accessToken } = data;

        // 更新 access token
        localStorage.setItem("access_token", accessToken);

        // 重试原请求
        if (error.config.headers) {
          error.config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient.request(error.config);
      } catch (refreshError) {
        // refresh token 也无效，跳转到登录页
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;

// 用户相关 API
export const userApi = {
  async getProfile() {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  },

  async updateProfile(profileData: { name?: string; email?: string }) {
    const response = await apiClient.put("/auth/profile", profileData);
    return response.data;
  },

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    const response = await apiClient.put("/auth/change-password", passwordData);
    return response.data;
  },
};

// 文件处理工具
export const fileUtils = {
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  },

  async fileToBlob(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const blob = new Blob([reader.result as ArrayBuffer]);
        resolve(URL.createObjectURL(blob));
      };
      reader.onerror = (error) => reject(error);
    });
  },
};
