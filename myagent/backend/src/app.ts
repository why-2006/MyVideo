import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { config } from "./config";

export function createApp(): Application {
  const app = express();

  // 安全头
  app.use(helmet());

  // CORS 配置
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    }),
  );

  // JSON 解析
  app.use(express.json());

  // 日志
  if (config.server.env === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // API 路由
  app.use("/api", apiRoutes);

  // 健康检查
  app.get("/health", (req, res) => {
    res.json({
      success: true,
      message: "Server is running",
      timestamp: new Date().toISOString(),
    });
  });

  // 404 处理
  app.use(notFoundHandler);

  // 全局错误处理
  app.use(errorHandler);

  return app;
}
