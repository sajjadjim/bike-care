import mongoose, { Schema, Model } from 'mongoose';
import { IPartCatalogItem } from '@/types';

const PartCatalogSchema = new Schema<IPartCatalogItem>(
  {
    partId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    vehicleType: { type: String, enum: ['motorcycle', 'car', 'all'], required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    description: { type: String },
    suggestedInspectionIntervalKM: { type: Number },
    suggestedReplacementIntervalKM: { type: Number },
    suggestedInspectionMonths: { type: Number },
    suggestedReplacementMonths: { type: Number },
    defaultActions: [{ type: String }],
    isCustom: { type: Boolean, default: false },
    ownerId: { type: String },
  },
  {
    timestamps: true,
  }
);

PartCatalogSchema.index({ vehicleType: 1, category: 1 });

export const PartCatalog: Model<IPartCatalogItem> =
  mongoose.models.PartCatalog ||
  mongoose.model<IPartCatalogItem>('PartCatalog', PartCatalogSchema);
