import mongoose, { Schema, Document } from 'mongoose';

export enum DocumentTypeEnum {
  BILL_OF_LADING = 'BILL_OF_LADING',
  COMMERCIAL_INVOICE = 'COMMERCIAL_INVOICE',
  CERTIFICATE_OF_ORIGIN = 'CERTIFICATE_OF_ORIGIN',
  PACKING_LIST = 'PACKING_LIST',
  INSURANCE_CERTIFICATE = 'INSURANCE_CERTIFICATE',
  DRAFT = 'DRAFT'
}

export interface IDiscrepancy {
  description: string;
  status: 'RAISED' | 'WAIVED' | 'PENDING';
  decidedBy?: string;
  comment?: string;
}

export interface ILcDocument extends Document {
  lcId: string;
  documentType: DocumentTypeEnum;
  fileUrl: string;
  submittedBy: string;
  complianceStatus: 'PASS' | 'FAIL' | 'MANUAL_REVIEW' | 'PENDING';
  discrepancies: IDiscrepancy[];
  riskScore: number;
  qualityWarning: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const DiscrepancySchema = new Schema<IDiscrepancy>({
  description: { type: String, required: true },
  status: { type: String, enum: ['RAISED', 'WAIVED', 'PENDING'], default: 'PENDING' },
  decidedBy: { type: String },
  comment: { type: String }
});

const LcDocumentSchema = new Schema<ILcDocument>({
  lcId: { type: String, required: true, index: true },
  documentType: { type: String, enum: Object.values(DocumentTypeEnum), required: true },
  fileUrl: { type: String, required: true },
  submittedBy: { type: String, required: true },
  complianceStatus: { type: String, enum: ['PASS', 'FAIL', 'MANUAL_REVIEW', 'PENDING'], default: 'PENDING' },
  discrepancies: { type: [DiscrepancySchema], default: [] },
  riskScore: { type: Number, default: 0 },
  qualityWarning: { type: String, default: null },
}, {
  timestamps: true
});

export const LcDocumentModel = mongoose.model<ILcDocument>('LcDocument', LcDocumentSchema, 'lc_documents');
