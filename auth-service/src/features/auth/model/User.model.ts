import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  TRADE_OFFICER = 'TRADE_OFFICER',
  COMPLIANCE_ANALYST = 'COMPLIANCE_ANALYST',
  SETTLEMENT_OFFICER = 'SETTLEMENT_OFFICER',
  ADMIN = 'ADMIN',
  READ_ONLY = 'READ_ONLY'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  INACTIVE = 'INACTIVE'
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  failedLoginCount: number;
  lockoutUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  id: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
  failedLoginCount: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null }
}, {
  timestamps: true
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
