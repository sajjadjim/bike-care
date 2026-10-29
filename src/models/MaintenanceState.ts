import mongoose, { Schema, Model } from 'mongoose';
import { IMaintenanceState } from '@/types';

const MaintenanceStateSchema = new Schema<IMaintenanceState>(
  {
    ownerId: { type: String, required: true, index: true },
    vehicleId: { type: String, required: true, index: true },
    partId: { type: String, required: true },
    partName: { type: String, required: true },
    category: { type: String, required: true },
    maintenanceTaskId: { type: String, required: true },
    lastAction: {
      type: String,
      enum: ['REPLACED', 'REPAIRED', 'CLEANED', 'INSPECTED', 'ADJUSTED', 'LUBRICATED'],
      required: true,
    },
    lastServiceDate: { type: Date, required: true },
    lastServiceOdometer: { type: Number, required: true },
    brand: { type: String },
    partsCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    notes: { type: String },
    intervalKM: { type: Number },
    intervalMonths: { type: Number },
    nextDueOdometer: { type: Number },
    nextDueDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

MaintenanceStateSchema.index(
  { vehicleId: 1, partId: 1, maintenanceTaskId: 1 },
  { unique: true }
);

MaintenanceStateSchema.index({ ownerId: 1, vehicleId: 1, nextDueOdometer: 1 });

export const MaintenanceState: Model<IMaintenanceState> =
  mongoose.models.MaintenanceState ||
  mongoose.model<IMaintenanceState>('MaintenanceState', MaintenanceStateSchema);
