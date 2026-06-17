import mongoose, { Document, Schema } from 'mongoose';

export interface ISettlement extends Document {
  settlementId: string;
  lcId: string;
  settlementAmount: mongoose.Types.Decimal128;
  currency: string;
  authorizedBy: string;
  overrideApprovedBy: string | null;
  overrideComment: string | null;
  settledAt: Date;
}

const SettlementSchema = new Schema<ISettlement>({
  settlementId: { type: String, required: true, unique: true },
  lcId: { type: String, required: true, unique: true },
  settlementAmount: { type: mongoose.Schema.Types.Decimal128, required: true },
  currency: { type: String, required: true },
  authorizedBy: { type: String, required: true },
  overrideApprovedBy: { type: String, default: null },
  overrideComment: { type: String, default: null },
  settledAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const SettlementModel = mongoose.model<ISettlement>('Settlement', SettlementSchema);
