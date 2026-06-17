import mongoose, { Document, Schema } from 'mongoose';

export enum LCStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  AMENDED = 'AMENDED',
  SETTLED = 'SETTLED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export interface ILetterOfCredit extends Document {
  applicant: string;
  beneficiary: string;
  amount: mongoose.Types.Decimal128;
  currency: string;
  paymentType: string;
  partialShipments: boolean;
  transshipment: boolean;
  status: LCStatus;
  version: number;
  statusHistory: any[];
  documentsUnderReview: boolean;
  documentsRequired: any[];
  timeline: any[];
  riskFlags: any[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  settledAt?: Date;
}

const LCSchema = new Schema<ILetterOfCredit>({
  applicant: { type: String, required: true },
  beneficiary: { type: String, required: true },
  amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  currency: { type: String, required: true, default: 'USD' },
  paymentType: { type: String, required: true },
  partialShipments: { type: Boolean, default: false },
  transshipment: { type: Boolean, default: false },
  status: { type: String, enum: Object.values(LCStatus), default: LCStatus.PENDING_APPROVAL },
  version: { type: Number, default: 0 },
  statusHistory: { type: [Object], default: [] },
  documentsUnderReview: { type: Boolean, default: false },
  documentsRequired: { type: [Object], default: [] },
  timeline: { type: [Object], default: [] },
  riskFlags: { type: [Object], default: [] },
  createdBy: { type: String, required: true },
  settledAt: { type: Date }
}, {
  timestamps: true
});

export const LCModel = mongoose.model<ILetterOfCredit>('LetterOfCredit', LCSchema);
