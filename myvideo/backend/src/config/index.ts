import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  huggingFace: {
    apiUrl: process.env.HF_API_URL || 'https://api-inference.huggingface.co',
    apiKey: process.env.HF_API_TOKEN || '',
  },
  logger: {
    level: process.env.LOG_LEVEL || 'dev',
  },
};
