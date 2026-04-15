import type { Request } from "express";
//拓展Express的Request接口，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export {};
