import mongoose, { Schema, Model } from 'mongoose';
import { IVehicle } from '@/types';

const VehicleSchema = new Schema<IVehicle>(
  {
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['motorcycle', 'car'], required: true },
    manufacturer: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    registrationYear: { type: Number },
    engineCC: { type: Number },
    fuelType: {
      type: String,
      enum: ['Octane', 'Petrol', 'Diesel', 'CNG', 'LPG', 'Electric', 'Hybrid'],
      default: 'Octane',
    },
    registrationNumber: { type: String, required: true },
    currentOdometer: { type: Number, required: true, default: 0 },
    purchaseDate: { type: Date },
    image: { type: String },
    color: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

VehicleSchema.index({ ownerId: 1, createdAt: -1 });

export const Vehicle: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
