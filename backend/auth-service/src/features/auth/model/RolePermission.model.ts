import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from './User.model';

export interface IRolePermission extends Document {
  role: UserRole;
  allowedEndpoints: string[];
  updatedBy: string;
  updatedAt: Date;
}

const RolePermissionSchema = new Schema<IRolePermission>({
  role: { type: String, enum: Object.values(UserRole), required: true, unique: true },
  allowedEndpoints: { type: [String], required: true },
  updatedBy: { type: String, required: true }
}, {
  timestamps: true
});

export const RolePermissionModel = mongoose.model<IRolePermission>('RolePermission', RolePermissionSchema);
