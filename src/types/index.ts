export type VehicleType = 'motorcycle' | 'car';

export type MaintenanceAction =
  | 'REPLACED'
  | 'REPAIRED'
  | 'CLEANED'
  | 'INSPECTED'
  | 'ADJUSTED'
  | 'LUBRICATED';

export type MaintenanceStatus = 'GREEN' | 'YELLOW' | 'RED' | 'GRAY';

export type DocumentType =
  | 'TAX_TOKEN'
  | 'REGISTRATION'
  | 'FITNESS'
  | 'INSURANCE'
  | 'ROUTE_PERMIT'
  | 'OTHER';

export type FuelType = 'Octane' | 'Petrol' | 'Diesel' | 'CNG' | 'LPG' | 'Electric' | 'Hybrid';

export interface IUser {
  _id?: string;
  firebaseUid: string;
  fullName: string;
  email: string;
  avatar?: string;
  phone?: string;
  country?: string;
  preferredLanguage?: string;
  currency?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lastLoginDate?: string | Date;
}

export interface IVehicle {
  _id?: string;
  ownerId: string;
  name: string;
  type: VehicleType;
  manufacturer: string;
  model: string;
  year: number;
  registrationYear?: number;
  engineCC?: number;
  fuelType?: FuelType;
  registrationNumber: string;
  currentOdometer: number;
  purchaseDate?: string | Date;
  image?: string;
  color?: string;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IOdometerReading {
  _id?: string;
  ownerId: string;
  vehicleId: string;
  reading: number;
  recordedAt: string | Date;
  notes?: string;
  isCorrection?: boolean;
  correctionReason?: string;
  createdAt?: string | Date;
}

export interface IPartCatalogItem {
  _id?: string;
  partId: string;
  name: string;
  vehicleType: VehicleType | 'all';
  category: string;
  subcategory?: string;
  description?: string;
  suggestedInspectionIntervalKM?: number;
  suggestedReplacementIntervalKM?: number;
  suggestedInspectionMonths?: number;
  suggestedReplacementMonths?: number;
  defaultActions: MaintenanceAction[];
  isCustom?: boolean;
  ownerId?: string;
}

export interface IMaintenanceState {
  _id?: string;
  ownerId: string;
  vehicleId: string;
  partId: string;
  partName: string;
  category: string;
  maintenanceTaskId: string; // e.g. "replace", "clean", "inspect"
  lastAction: MaintenanceAction;
  lastServiceDate: string | Date;
  lastServiceOdometer: number;
  brand?: string;
  partsCost?: number;
  laborCost?: number;
  totalCost: number;
  notes?: string;
  intervalKM?: number;
  intervalMonths?: number;
  nextDueOdometer?: number;
  nextDueDate?: string | Date;
  status?: MaintenanceStatus;
  remainingKM?: number;
  remainingDays?: number;
  updatedAt?: string | Date;
}

export interface IMaintenanceHistory {
  _id?: string;
  ownerId: string;
  vehicleId: string;
  partId: string;
  partName: string;
  category: string;
  maintenanceTaskId: string;
  action: MaintenanceAction;
  serviceDate: string | Date;
  odometer: number;
  brand?: string;
  partsCost?: number;
  laborCost?: number;
  totalCost: number;
  notes?: string;
  createdAt?: string | Date;
}

export interface IOilProduct {
  _id?: string;
  brand: string;
  productName: string;
  viscosity: string;
  oilType: 'Mineral' | 'Semi-Synthetic' | 'Fully Synthetic';
  recommendedIntervalKM: number;
  recommendedIntervalMonths: number;
  compatibleVehicleTypes: VehicleType[];
  specifications?: string;
  notes?: string;
}

export interface IVehicleDocument {
  _id?: string;
  ownerId: string;
  vehicleId: string;
  documentType: DocumentType;
  documentNumber?: string;
  issueDate?: string | Date;
  expiryDate: string | Date;
  renewalCost?: number;
  reminderDaysBefore?: number;
  notes?: string;
  fileUrl?: string;
  status?: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  remainingDays?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface INotification {
  _id?: string;
  ownerId: string;
  vehicleId?: string;
  vehicleName?: string;
  title: string;
  message: string;
  type: 'WARNING' | 'DANGER' | 'INFO' | 'SUCCESS';
  category: 'OIL' | 'MAINTENANCE' | 'DOCUMENT' | 'SYSTEM';
  isRead: boolean;
  link?: string;
  createdAt: string | Date;
}
