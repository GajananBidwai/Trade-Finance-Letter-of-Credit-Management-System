import { UserModel, IUser } from '../model/User.model';

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async updateFailedLogin(id: string, count: number, lockoutUntil: Date | null = null): Promise<void> {
    await UserModel.updateOne(
      { _id: id },
      { failedLoginCount: count, lockoutUntil }
    );
  }

  async resetFailedLogin(id: string): Promise<void> {
    await UserModel.updateOne(
      { _id: id },
      { failedLoginCount: 0, lockoutUntil: null }
    );
  }
}
