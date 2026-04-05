import { Request, Response, NextFunction } from "express";
import { jwtService } from "../services/jwt.service";
import {
  findUserByEmail,
  comparePassword,
  createUser,
} from "../services/user.service";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const userRecord = await findUserByEmail(email);
    if (
      !userRecord ||
      !(await comparePassword(password, userRecord.password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const username = userRecord.username || userRecord.email.split("@")[0];
    const tokenPayload = {
      userId: userRecord.id.toString(),
      email: userRecord.email,
      username,
      name: userRecord.name,
    };
    const user = {
      id: userRecord.id.toString(),
      userId: userRecord.id.toString(),
      email: userRecord.email,
      name: userRecord.name,
      username,
    };

    const accessToken = jwtService.generateToken(tokenPayload);
    const refreshToken = jwtService.generateToken(tokenPayload);

    res.json({
      success: true,
      data: {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password and name are required",
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const newUserId = await createUser(email, password, name);
    const username = email.split("@")[0];
    const tokenPayload = {
      userId: newUserId.toString(),
      email,
      username,
      name,
    };
    const user = {
      id: newUserId.toString(),
      userId: newUserId.toString(),
      email,
      name,
      username,
    };

    const accessToken = jwtService.generateToken(tokenPayload);
    const refreshToken = jwtService.generateToken(tokenPayload);

    res.status(201).json({
      success: true,
      data: {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      message: "Registration successful",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 刷新 token
 */
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const result = jwtService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: result,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    next(error);
  }
}
