import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/types';

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    avatar: { type: String },
    phone: { type: String },
    country: { type: String, default: 'Bangladesh' },
    preferredLanguage: { type: String, default: 'en' },
    currency: { type: String, default: 'BDT' },
    lastLoginDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
