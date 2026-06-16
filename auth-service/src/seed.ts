import bcrypt from 'bcrypt';
import { connectDB } from './config/db';
import { UserModel, UserRole, UserStatus } from './features/auth/model/User.model';
import mongoose from 'mongoose';

const seed = async () => {
  await connectDB();

  const email = 'officer@lumina.trade';
  const password = 'password123';

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    console.log(`User ${email} already exists.`);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new UserModel({
    email,
    passwordHash,
    role: UserRole.TRADE_OFFICER,
    status: UserStatus.ACTIVE,
  });

  await user.save();
  console.log(`Successfully seeded user: ${email} / ${password}`);
  process.exit(0);
};

seed().catch(err => {
  console.error('Failed to seed DB', err);
  process.exit(1);
});
