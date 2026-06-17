import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from '../repository/user.repository';
import { RefreshTokenRepository } from '../repository/refreshToken.repository';
import { LoginRequestDto, AuthResponseDto } from '../dto/auth.dto';
import { config } from '../../../config';
import { emitAuthEvent, AuthEventType } from '../events/auth.producer';
import { UserStatus } from '../model/User.model';
import { redisClient } from '../../../config/redis';

const userRepo = new UserRepository();
const refreshTokenRepo = new RefreshTokenRepository();

export class AuthService {
  async login(payload: LoginRequestDto, ipAddress: string): Promise<AuthResponseDto> {
    const user = await userRepo.findByEmail(payload.email);

    if (!user) {
      // Don't leak existence of email. Record dummy failure if needed, but we don't have a userId.
      throw { statusCode: 401, message: 'Invalid credentials', isOperational: true };
    }

    // Check Lockout
    if (user.status === UserStatus.LOCKED || (user.lockoutUntil && user.lockoutUntil > new Date())) {
      await emitAuthEvent(AuthEventType.AUTH_LOGIN, user.id, ipAddress, 'FAILURE');
      throw { statusCode: 423, message: 'Account locked. Try again after 10 minutes.', isOperational: true };
    }

    // Verify Password
    const isValid = await bcrypt.compare(payload.password!, user.passwordHash);

    if (!isValid) {
      const newFailCount = user.failedLoginCount + 1;
      let lockoutUntil = null;
      let newStatus: UserStatus = user.status;

      if (newFailCount >= config.security.maxFailedLoginAttempts) {
        lockoutUntil = new Date(Date.now() + config.security.lockoutDurationMs);
        newStatus = UserStatus.LOCKED;
        await emitAuthEvent(AuthEventType.AUTH_LOCKOUT, user.id, ipAddress, 'SUCCESS');
      }

      await userRepo.updateFailedLogin(user.id, newFailCount, lockoutUntil);
      await emitAuthEvent(AuthEventType.AUTH_LOGIN, user.id, ipAddress, 'FAILURE');

      if (newStatus === UserStatus.LOCKED) {
        throw { statusCode: 423, message: 'Account locked. Try again after 10 minutes.', isOperational: true };
      }

      throw { statusCode: 401, message: 'Invalid credentials', isOperational: true };
    }

    // Success
    await userRepo.resetFailedLogin(user.id);
    
    // Generate Tokens
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    
    // Default 7 days
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await refreshTokenRepo.createToken(user.id, tokenHash, refreshExpiresAt);

    await emitAuthEvent(AuthEventType.AUTH_LOGIN, user.id, ipAddress, 'SUCCESS');

    return {
      token,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        role: user.role,
        email: user.email
      }
    };
  }

  async refresh(rawRefreshToken: string): Promise<AuthResponseDto> {
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    const tokenRecord = await refreshTokenRepo.findByHash(tokenHash);

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw { statusCode: 401, message: 'Invalid or expired refresh token', isOperational: true };
    }

    const user = await userRepo.findById(tokenRecord.userId.toString());
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw { statusCode: 401, message: 'User not active or not found', isOperational: true };
    }

    // Revoke old token (single-use)
    await refreshTokenRepo.revokeToken(tokenRecord.id);

    // Generate new JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );

    // Optional: issue new refresh token (rotating refresh token). Following FR-01-4.
    const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
    const newTokenHash = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await refreshTokenRepo.createToken(user.id, newTokenHash, refreshExpiresAt);
    
    await emitAuthEvent(AuthEventType.AUTH_REFRESH, user.id, 'internal', 'SUCCESS');

    return {
      token,
      refreshToken: newRawRefreshToken
    };
  }

  async logout(token: string, ipAddress: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, { ignoreExpiration: true }) as any;
      if (decoded && decoded.userId) {
        // Add to Redis blocklist until expiry
        const exp = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 0;
        if (exp > 0) {
          await redisClient.setEx(`bl_${token}`, exp, 'revoked');
        }
        await refreshTokenRepo.revokeAllUserTokens(decoded.userId);
        await emitAuthEvent(AuthEventType.AUTH_LOGOUT, decoded.userId, ipAddress, 'SUCCESS');
      }
    } catch (error) {
      // Ignore invalid tokens on logout
    }
  }
}
