import mongoose, { Schema, Model } from 'mongoose';
import { IOilProduct } from '@/types';

const OilProductSchema = new Schema<IOilProduct>(
  {
    brand: { type: String, required: true },
    productName: { type: String, required: true },
    viscosity: { type: String, required: true },
    oilType: {
      type: String,
      enum: ['Mineral', 'Semi-Synthetic', 'Fully Synthetic'],
      required: true,
    },
    recommendedIntervalKM: { type: Number, required: true },
    recommendedIntervalMonths: { type: Number, required: true },
    compatibleVehicleTypes: [{ type: String, enum: ['motorcycle', 'car'] }],
    specifications: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

OilProductSchema.index({ brand: 1, productName: 1 });

export const OilProduct: Model<IOilProduct> =
  mongoose.models.OilProduct ||
  mongoose.model<IOilProduct>('OilProduct', OilProductSchema);
