import mongoose, { Document, Schema } from 'mongoose';

export enum MutationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface IPendingMutation extends Document {
  targetUserId?: string; // Optional for creating a new user
  initiatedBy: string;
  proposedChanges: any;
  status: MutationStatus;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PendingMutationSchema = new Schema<IPendingMutation>({
  targetUserId: { type: String, default: null },
  initiatedBy: { type: String, required: true },
  proposedChanges: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: Object.values(MutationStatus), default: MutationStatus.PENDING },
  approvedBy: { type: String, default: null }
}, {
  timestamps: true
});

export const PendingMutationModel = mongoose.model<IPendingMutation>('PendingMutation', PendingMutationSchema);
