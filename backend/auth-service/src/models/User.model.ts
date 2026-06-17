import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissions: string[];
  lastLogin?: Date;
  pendingChanges?: Record<string, any>; // Used for dual-approval
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['ADMIN', 'TRADE_OFFICER', 'COMPLIANCE_ANALYST', 'SETTLEMENT_OFFICER', 'READ_ONLY'] },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  permissions: [{ type: String }],
  lastLogin: { type: Date },
  pendingChanges: { type: Schema.Types.Mixed, default: null }
}, {
  timestamps: true
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
