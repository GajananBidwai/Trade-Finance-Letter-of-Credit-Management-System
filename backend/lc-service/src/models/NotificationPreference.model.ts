import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationPreference extends Document {
  userId: string;
  channels: {
    EMAIL: boolean;
    SMS: boolean;
    IN_APP: boolean;
  };
  events: {
    LC_SUBMITTED: boolean;
    LC_STATUS_CHANGED: boolean;
    DOCUMENT_COMPLIANCE_FLAG: boolean;
    SETTLEMENT_CONFIRMED: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  channels: {
    EMAIL: { type: Boolean, default: true },
    SMS: { type: Boolean, default: false },
    IN_APP: { type: Boolean, default: true }
  },
  events: {
    LC_SUBMITTED: { type: Boolean, default: true },
    LC_STATUS_CHANGED: { type: Boolean, default: true },
    DOCUMENT_COMPLIANCE_FLAG: { type: Boolean, default: true },
    SETTLEMENT_CONFIRMED: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

export const NotificationPreferenceModel = mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);
