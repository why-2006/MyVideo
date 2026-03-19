import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.service';

/**
 * 用户登录
 * 注意：这是一个示例实现，实际应用中应该从数据库查询用户
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // TODO: 从数据库验证用户凭证
    // const user = await userService.findByEmail(email);
    // if (!user || !bcrypt.compareSync(password, user.password)) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Invalid email or password',
    //   });
    // }

    // 模拟用户
    const user = { userId: '1', email: email || 'user@example.com', name: 'Test User' };

    const accessToken = jwtService.generateToken(user);
    const refreshToken = jwtService.generateToken(user);

    res.json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken,
      },
      message: 'Login successful',
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
        message: 'Refresh token is required',
      });
    }

    const result = jwtService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    next(error);
  }
}
