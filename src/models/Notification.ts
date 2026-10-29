import mongoose, { Schema, Model } from 'mongoose';
import { INotification } from '@/types';

const NotificationSchema = new Schema<INotification>(
  {
    ownerId: { type: String, required: true, index: true },
    vehicleId: { type: String },
    vehicleName: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['WARNING', 'DANGER', 'INFO', 'SUCCESS'], required: true },
    category: { type: String, enum: ['OIL', 'MAINTENANCE', 'DOCUMENT', 'SYSTEM'], required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ ownerId: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
