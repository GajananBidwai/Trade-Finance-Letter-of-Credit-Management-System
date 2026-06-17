import mongoose, { Schema, Document } from 'mongoose';

export interface IAiInteraction extends Document {
  interactionType: 'DOCUMENT_ANALYSIS' | 'QUERY';
  lcId?: string;
  userId: string;
  input: Record<string, any>;
  output: Record<string, any>;
  riskScore?: number;
  retryCount: number;
  finalStatus: 'SUCCESS' | 'FALLBACK_MANUAL_REVIEW';
  createdAt: Date;
}

const AiInteractionSchema: Schema = new Schema({
  interactionType: { type: String, required: true, enum: ['DOCUMENT_ANALYSIS', 'QUERY'] },
  lcId: { type: String, index: true },
  userId: { type: String, required: true, index: true },
  input: { type: Schema.Types.Mixed, required: true },
  output: { type: Schema.Types.Mixed },
  riskScore: { type: Number },
  retryCount: { type: Number, default: 0 },
  finalStatus: { type: String, enum: ['SUCCESS', 'FALLBACK_MANUAL_REVIEW'] },
  createdAt: { type: Date, default: Date.now }
});

export const AiInteractionModel = mongoose.model<IAiInteraction>('AiInteraction', AiInteractionSchema);
