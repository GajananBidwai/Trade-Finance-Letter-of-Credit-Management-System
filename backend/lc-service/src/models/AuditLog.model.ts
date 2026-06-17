import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  eventId: string;
  eventType: string;
  module: string;
  action: string;
  performedBy: string;
  lcId?: string;
  details: Record<string, any>;
  timestamp: Date;
  jurisdiction: string;
}

const AuditLogSchema: Schema = new Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true, index: true },
  module: { type: String, required: true },
  action: { type: String, required: true },
  performedBy: { type: String, required: true, index: true },
  lcId: { type: String, index: true },
  details: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true },
  jurisdiction: { type: String, default: 'GLOBAL' }
}, {
  // Disable automatic update tracking as records are immutable
  timestamps: false
});

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
