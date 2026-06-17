import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: string;
  eventType: string;
  message: string;
  channel: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  read: boolean;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipientId: { type: String, required: true, index: true },
  eventType: { type: String, required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ['EMAIL', 'SMS', 'IN_APP'], required: true },
  status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
  read: { type: Boolean, default: false },
  retryCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
