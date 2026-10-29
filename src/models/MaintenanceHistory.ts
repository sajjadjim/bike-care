import mongoose, { Schema, Model } from 'mongoose';
import { IMaintenanceHistory } from '@/types';

const MaintenanceHistorySchema = new Schema<IMaintenanceHistory>(
  {
    ownerId: { type: String, required: true, index: true },
    vehicleId: { type: String, required: true, index: true },
    partId: { type: String, required: true },
    partName: { type: String, required: true },
    category: { type: String, required: true },
    maintenanceTaskId: { type: String, required: true },
    action: {
      type: String,
      enum: ['REPLACED', 'REPAIRED', 'CLEANED', 'INSPECTED', 'ADJUSTED', 'LUBRICATED'],
      required: true,
    },
    serviceDate: { type: Date, required: true },
    odometer: { type: Number, required: true },
    brand: { type: String },
    partsCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

MaintenanceHistorySchema.index({ vehicleId: 1, serviceDate: -1 });
MaintenanceHistorySchema.index({ ownerId: 1, serviceDate: -1 });

export const MaintenanceHistory: Model<IMaintenanceHistory> =
  mongoose.models.MaintenanceHistory ||
  mongoose.model<IMaintenanceHistory>('MaintenanceHistory', MaintenanceHistorySchema);
