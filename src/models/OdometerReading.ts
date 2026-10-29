import mongoose, { Schema, Model } from 'mongoose';
import { IOdometerReading } from '@/types';

const OdometerReadingSchema = new Schema<IOdometerReading>(
  {
    ownerId: { type: String, required: true, index: true },
    vehicleId: { type: String, required: true, index: true },
    reading: { type: Number, required: true },
    recordedAt: { type: Date, required: true, default: Date.now },
    notes: { type: String },
    isCorrection: { type: Boolean, default: false },
    correctionReason: { type: String },
  },
  {
    timestamps: true,
  }
);

OdometerReadingSchema.index({ vehicleId: 1, recordedAt: -1 });

export const OdometerReading: Model<IOdometerReading> =
  mongoose.models.OdometerReading ||
  mongoose.model<IOdometerReading>('OdometerReading', OdometerReadingSchema);
