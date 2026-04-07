import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
}

export class JwtService {
  private secret: string;
  private expiresIn: string;

  constructor() {
    this.secret = config.jwt.secret;
    this.expiresIn = config.jwt.expiresIn;
  }

  /**
   * 生成 access token
   */
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as any });
  }

  /**
   * 验证 token
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * 刷新 token
   */
  refreshToken(refreshToken: string): { accessToken: string; expiresIn: string } {
    try {
      const decoded = jwt.verify(refreshToken, this.secret) as TokenPayload;
      const newToken = this.generateToken(decoded);
      return {
        accessToken: newToken,
        expiresIn: this.expiresIn,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

// 导出单例
export const jwtService = new JwtService();
