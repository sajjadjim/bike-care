import mongoose, { Schema, Model } from 'mongoose';
import { IVehicleDocument } from '@/types';

const VehicleDocumentSchema = new Schema<IVehicleDocument>(
  {
    ownerId: { type: String, required: true, index: true },
    vehicleId: { type: String, required: true, index: true },
    documentType: {
      type: String,
      enum: ['TAX_TOKEN', 'REGISTRATION', 'FITNESS', 'INSURANCE', 'ROUTE_PERMIT', 'OTHER'],
      required: true,
    },
    documentNumber: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date, required: true },
    renewalCost: { type: Number, default: 0 },
    reminderDaysBefore: { type: Number, default: 30 },
    notes: { type: String },
    fileUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

VehicleDocumentSchema.index({ vehicleId: 1, expiryDate: 1 });
VehicleDocumentSchema.index({ ownerId: 1, expiryDate: 1 });

export const VehicleDocumentRecord: Model<IVehicleDocument> =
  mongoose.models.VehicleDocumentRecord ||
  mongoose.model<IVehicleDocument>('VehicleDocumentRecord', VehicleDocumentSchema);
