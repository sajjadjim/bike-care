import { z } from 'zod';

export const vehicleFormSchema = z.object({
  name: z.string().min(2, 'Vehicle name or nickname is required'),
  type: z.enum(['motorcycle', 'car'], {
    required_error: 'Please select vehicle type',
  }),
  manufacturer: z.string().min(1, 'Please select or enter manufacturer'),
  model: z.string().min(1, 'Please select or enter model'),
  year: z.coerce.number().min(1970).max(new Date().getFullYear() + 1),
  registrationYear: z.coerce.number().min(1970).max(new Date().getFullYear() + 1).optional(),
  engineCC: z.coerce.number().positive().optional(),
  fuelType: z.enum(['Octane', 'Petrol', 'Diesel', 'CNG', 'LPG', 'Electric', 'Hybrid']).default('Octane'),
  registrationNumber: z.string().min(3, 'Registration number (e.g. Dhaka Metro LA-11-2233) is required'),
  currentOdometer: z.coerce.number().min(0, 'Current odometer reading must be positive'),
  purchaseDate: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  color: z.string().optional(),
  notes: z.string().optional(),
});

export const odometerUpdateSchema = z.object({
  reading: z.coerce.number().min(0, 'Odometer reading cannot be negative'),
  recordedAt: z.string().default(() => new Date().toISOString()),
  notes: z.string().optional(),
  isCorrection: z.boolean().default(false),
  correctionReason: z.string().optional(),
});

export const maintenanceRecordSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  partId: z.string().min(1, 'Part is required'),
  partName: z.string().min(1, 'Part name is required'),
  category: z.string().min(1, 'Category is required'),
  maintenanceTaskId: z.string().default('standard_service'),
  action: z.enum(['REPLACED', 'REPAIRED', 'CLEANED', 'INSPECTED', 'ADJUSTED', 'LUBRICATED']),
  serviceDate: z.string().min(1, 'Service date is required'),
  odometer: z.coerce.number().min(0, 'Odometer reading is required'),
  brand: z.string().optional(),
  partsCost: z.coerce.number().min(0).default(0),
  laborCost: z.coerce.number().min(0).default(0),
  totalCost: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  intervalKM: z.coerce.number().positive().optional(),
  intervalMonths: z.coerce.number().positive().optional(),
});

export const engineOilChangeSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  oilBrand: z.string().min(1, 'Oil brand is required'),
  oilProductName: z.string().min(1, 'Oil product name is required'),
  viscosity: z.string().min(2, 'Viscosity is required (e.g. 10W-40)'),
  oilType: z.enum(['Mineral', 'Semi-Synthetic', 'Fully Synthetic']),
  oilQuantity: z.coerce.number().positive('Oil quantity in Liters'),
  oilChangeDate: z.string().min(1, 'Change date is required'),
  odometerAtChange: z.coerce.number().min(0, 'Odometer reading is required'),
  recommendedIntervalKM: z.coerce.number().min(500, 'Recommended KM interval'),
  recommendedIntervalMonths: z.coerce.number().min(1, 'Recommended months interval').default(3),
  oilPrice: z.coerce.number().min(0).default(0),
  serviceCharge: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

export const vehicleDocumentSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  documentType: z.enum(['TAX_TOKEN', 'REGISTRATION', 'FITNESS', 'INSURANCE', 'ROUTE_PERMIT', 'OTHER']),
  documentNumber: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  renewalCost: z.coerce.number().min(0).default(0),
  reminderDaysBefore: z.coerce.number().default(30),
  notes: z.string().optional(),
});
