import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../service/auth.service';
import { loginSchema, refreshSchema, logoutSchema } from '../validation/auth.validation';
import { sendSuccess } from '../../../utils/response.util';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        throw { statusCode: 400, message: error.details[0].message, isOperational: true };
      }

      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const result = await authService.login(value, ipAddress);
      
      sendSuccess(res, 200, result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = refreshSchema.validate(req.body);
      if (error) {
        throw { statusCode: 400, message: error.details[0].message, isOperational: true };
      }

      const result = await authService.refresh(value.refreshToken);
      sendSuccess(res, 200, result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = logoutSchema.validate(req.body);
      if (error) {
        throw { statusCode: 400, message: error.details[0].message, isOperational: true };
      }

      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      await authService.logout(value.token, ipAddress);
      
      sendSuccess(res, 200, null, 'Logged out');
    } catch (error) {
      next(error);
    }
  }
}
