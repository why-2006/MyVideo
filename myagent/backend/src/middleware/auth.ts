import { Request, Response, NextFunction } from "express";
import { jwtService } from "../services/jwt.service";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = jwtService.verifyToken(token);

    // 将用户信息添加到请求对象
    (req as Request & { user?: { userId: string; email: string } }).user =
      decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
