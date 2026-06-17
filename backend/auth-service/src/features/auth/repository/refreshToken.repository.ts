import { RefreshTokenModel, IRefreshToken } from '../model/RefreshToken.model';

export class RefreshTokenRepository {
  async createToken(userId: string, tokenHash: string, expiresAt: Date): Promise<IRefreshToken> {
    const token = new RefreshTokenModel({
      userId,
      tokenHash,
      expiresAt
    });
    return token.save();
  }

  async findByHash(tokenHash: string): Promise<IRefreshToken | null> {
    return RefreshTokenModel.findOne({ tokenHash, revoked: false });
  }

  async revokeToken(id: string): Promise<void> {
    await RefreshTokenModel.updateOne({ _id: id }, { revoked: true });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany({ userId }, { revoked: true });
  }
}
