import mongoose, { Schema, Document } from 'mongoose';

export interface IExportJob extends Document {
  jobId: string;
  requestedBy: string;
  reportType: 'AUDIT' | 'SETTLEMENT' | 'COMPLIANCE';
  format: 'PDF' | 'CSV';
  filters: Record<string, any>;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED';
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}

const ExportJobSchema: Schema = new Schema({
  jobId: { type: String, required: true, unique: true },
  requestedBy: { type: String, required: true },
  reportType: { type: String, required: true, enum: ['AUDIT', 'SETTLEMENT', 'COMPLIANCE'] },
  format: { type: String, required: true, enum: ['PDF', 'CSV'] },
  filters: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, required: true, enum: ['PENDING', 'PROCESSING', 'COMPLETE', 'FAILED'], default: 'PENDING' },
  downloadUrl: { type: String },
  completedAt: { type: Date }
}, {
  timestamps: true
});

export const ExportJobModel = mongoose.model<IExportJob>('ExportJob', ExportJobSchema);
