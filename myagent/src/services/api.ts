import axios, { type AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
  timeout: 60000,
});

// 请求拦截器：请求头自动添加 Authorization，并进行错误处理
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

// 文件处理工具
export const fileUtils = {
  async compressImage(
    file: File,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      maxFileSizeMB?: number;
    },
  ): Promise<File> {
    const {
      maxWidth = 1920,
      maxHeight = 1920,
      quality = 0.82,
      maxFileSizeMB = 1,
    } = options ?? {};

    const shouldCompress =
      file.size > maxFileSizeMB * 1024 * 1024 || file.type === "image/png";

    if (!shouldCompress || typeof window === "undefined") {
      return file;
    }

    const imageUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () =>
          reject(new Error("Failed to load image for compression"));
        element.src = imageUrl;
      });

      let { width, height } = image;
      const scale = Math.min(maxWidth / width, maxHeight / height, 1);

      if (scale < 1) {
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        return file;
      }

      context.drawImage(image, 0, 0, width, height);
      //将无损格式转换为有损格式，进一步压缩文件大小
      const outputType = file.type === "image/png" ? "image/jpeg" : file.type;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (!result) {
              reject(new Error("Failed to compress image"));
              return;
            }
            resolve(result);
          },
          outputType || "image/jpeg",
          outputType === "image/jpeg" || outputType === "image/webp"
            ? quality
            : undefined,
        );
      });

      const extension =
        outputType === "image/jpeg"
          ? "jpg"
          : outputType === "image/webp"
            ? "webp"
            : file.name.split(".").pop() || "png";
      //去除文件名中的扩展名
      const baseName = file.name.replace(/\.[^.]+$/, "") || "compressed-image";
      //生成新的File对象，保持原文件名但更新扩展名
      return new File([blob], `${baseName}.${extension}`, {
        type: blob.type || outputType || file.type || "image/jpeg",
        lastModified: Date.now(),
      });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  },

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
