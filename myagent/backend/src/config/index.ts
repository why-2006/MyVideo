import crypto from "crypto";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

function generateJwtSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const config = {
  server: {
    port: parseInt(process.env.PORT || "3001", 10),
    env: process.env.NODE_ENV || "development",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
  jwt: {
    secret: process.env.JWT_SECRET || generateJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  },
  database: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "my_video",
  },
  huggingFace: {
    apiUrl: process.env.HF_API_URL || "https://router.huggingface.co",
    apiKey: process.env.HF_API_TOKEN || "",
    proxyUrl:
      process.env.HTTPS_PROXY ||
      process.env.HTTP_PROXY ||
      process.env.HF_PROXY ||
      "",
    noProxy: process.env.NO_PROXY || process.env.no_proxy || "",
  },
  logger: {
    level: process.env.LOG_LEVEL || "dev",
  },
};
