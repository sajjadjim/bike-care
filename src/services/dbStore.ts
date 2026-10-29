import { connectToDatabase } from '@/lib/mongodb';
import { Vehicle } from '@/models/Vehicle';
import { User } from '@/models/User';
import { MaintenanceState } from '@/models/MaintenanceState';
import { MaintenanceHistory } from '@/models/MaintenanceHistory';
import { OdometerReading } from '@/models/OdometerReading';
import { VehicleDocumentRecord } from '@/models/VehicleDocument';
import { PartCatalog } from '@/models/PartCatalog';
import { Notification } from '@/models/Notification';
import { DEFAULT_PART_CATALOG } from '@/constants/catalog';

// In-memory fallback storage for when MongoDB Atlas URI is not yet provided in .env
interface InMemoryDB {
  users: Map<string, any>;
  vehicles: Map<string, any>;
  maintenanceStates: Map<string, any>;
  maintenanceHistory: any[];
  odometerReadings: any[];
  documents: Map<string, any>;
  partCatalog: any[];
  notifications: any[];
}

const globalStore = global as unknown as { __motocare_mem_db?: InMemoryDB };

if (!globalStore.__motocare_mem_db) {
  globalStore.__motocare_mem_db = {
    users: new Map(),
    vehicles: new Map(),
    maintenanceStates: new Map(),
    maintenanceHistory: [],
    odometerReadings: [],
    documents: new Map(),
    partCatalog: [...DEFAULT_PART_CATALOG],
    notifications: [],
  };

  // Seed default demo vehicle in memory if empty
  const demoVehicleId = 'demo-v1-yamaha-r15';
  const demoOwnerId = 'demo_user_pilot';

  globalStore.__motocare_mem_db.vehicles.set(demoVehicleId, {
    _id: demoVehicleId,
    ownerId: demoOwnerId,
    name: 'Phantom R15 V4',
    type: 'motorcycle',
    manufacturer: 'Yamaha',
    model: 'R15 V4',
    year: 2024,
    registrationYear: 2024,
    engineCC: 155,
    fuelType: 'Octane',
    registrationNumber: 'Dhaka Metro LA-55-9012',
    currentOdometer: 11500,
    purchaseDate: '2024-03-15',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    color: 'Racing Blue',
    notes: 'Primary daily commute and weekend highway tours.',
    createdAt: new Date().toISOString(),
  });

  // Odometer readings for demo vehicle
  globalStore.__motocare_mem_db.odometerReadings.push(
    {
      _id: 'odo-1',
      ownerId: demoOwnerId,
      vehicleId: demoVehicleId,
      reading: 10000,
      recordedAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
      notes: 'Oil change service reading',
    },
    {
      _id: 'odo-2',
      ownerId: demoOwnerId,
      vehicleId: demoVehicleId,
      reading: 10600,
      recordedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      notes: 'Weekly fuel top-up log',
    },
    {
      _id: 'odo-3',
      ownerId: demoOwnerId,
      vehicleId: demoVehicleId,
      reading: 11500,
      recordedAt: new Date().toISOString(),
      notes: 'Current commute reading',
    }
  );

  // Engine oil maintenance state
  const oilStateKey = `${demoVehicleId}:mc-eng-oil:OIL_CHANGE`;
  globalStore.__motocare_mem_db.maintenanceStates.set(oilStateKey, {
    _id: 'state-oil-1',
    ownerId: demoOwnerId,
    vehicleId: demoVehicleId,
    partId: 'mc-eng-oil',
    partName: 'Engine Oil',
    category: 'Engine',
    maintenanceTaskId: 'OIL_CHANGE',
    lastAction: 'REPLACED',
    lastServiceDate: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
    lastServiceOdometer: 10000,
    brand: 'Motul 7100 10W-40 Fully Synthetic',
    partsCost: 1550,
    laborCost: 150,
    totalCost: 1700,
    notes: 'High-performance synthetic oil with OEM filter change.',
    intervalKM: 3000,
    intervalMonths: 3,
    nextDueOdometer: 13000,
    nextDueDate: new Date(Date.now() + 40 * 24 * 3600 * 1000).toISOString(),
  });

  // Air filter maintenance state
  const airStateKey = `${demoVehicleId}:mc-eng-airfilter:CLEAN`;
  globalStore.__motocare_mem_db.maintenanceStates.set(airStateKey, {
    _id: 'state-air-1',
    ownerId: demoOwnerId,
    vehicleId: demoVehicleId,
    partId: 'mc-eng-airfilter',
    partName: 'Air Filter',
    category: 'Engine',
    maintenanceTaskId: 'CLEAN',
    lastAction: 'CLEANED',
    lastServiceDate: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    lastServiceOdometer: 10750,
    brand: 'OEM Yamaha',
    partsCost: 0,
    laborCost: 100,
    totalCost: 100,
    notes: 'Compressed air de-dusting during wash.',
    intervalKM: 2000,
    intervalMonths: 2,
    nextDueOdometer: 12750,
    nextDueDate: new Date(Date.now() + 35 * 24 * 3600 * 1000).toISOString(),
  });

  // Chain cleaning state
  const chainStateKey = `${demoVehicleId}:mc-trn-chainclean:CLEAN`;
  globalStore.__motocare_mem_db.maintenanceStates.set(chainStateKey, {
    _id: 'state-chain-1',
    ownerId: demoOwnerId,
    vehicleId: demoVehicleId,
    partId: 'mc-trn-chainclean',
    partName: 'Drive Chain Cleaning & Lube',
    category: 'Chain & Transmission',
    maintenanceTaskId: 'CLEAN',
    lastAction: 'CLEANED',
    lastServiceDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    lastServiceOdometer: 11150,
    brand: 'Motul C1/C2 Chain Clean & Lube',
    partsCost: 200,
    laborCost: 100,
    totalCost: 300,
    notes: 'Kerosene wash and Motul C2 road chain lube applied.',
    intervalKM: 500,
    intervalMonths: 1,
    nextDueOdometer: 11650,
    nextDueDate: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString(),
  });

  // Front brake pad state
  const brakeStateKey = `${demoVehicleId}:mc-brk-frontpad:INSPECT`;
  globalStore.__motocare_mem_db.maintenanceStates.set(brakeStateKey, {
    _id: 'state-brake-1',
    ownerId: demoOwnerId,
    vehicleId: demoVehicleId,
    partId: 'mc-brk-frontpad',
    partName: 'Front Brake Pad / Shoe',
    category: 'Braking System',
    maintenanceTaskId: 'INSPECT',
    lastAction: 'INSPECTED',
    lastServiceDate: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    lastServiceOdometer: 10300,
    brand: 'ByBre OEM',
    partsCost: 0,
    laborCost: 50,
    totalCost: 50,
    notes: 'Pads have 3.5mm thickness remaining. Good condition.',
    intervalKM: 2500,
    intervalMonths: 3,
    nextDueOdometer: 12800,
    nextDueDate: new Date(Date.now() + 50 * 24 * 3600 * 1000).toISOString(),
  });

  // Documents
  const docTaxKey = `${demoVehicleId}:TAX_TOKEN`;
  globalStore.__motocare_mem_db.documents.set(docTaxKey, {
    _id: 'doc-tax-1',
    ownerId: demoOwnerId,
    vehicleId: demoVehicleId,
    documentType: 'TAX_TOKEN',
    documentNumber: 'BRTA-TT-2024-99812',
    issueDate: '2024-03-15',
    expiryDate: new Date(Date.now() + 47 * 24 * 3600 * 1000).toISOString(),
    renewalCost: 2300,
    reminderDaysBefore: 30,
    notes: 'Dhaka North BRTA Circle.',
  });

  const docInsKey = `${demoVehicleId}:INSURANCE`;
  globalStore.__motocare_mem_db.documents.set(docInsKey, {
    _id: 'doc-ins-1',
    ownerId: demoOwnerId,
    vehicleId: demoVehicleId,
    documentType: 'INSURANCE',
    documentNumber: 'NIC-MBI-788219',
    issueDate: '2024-03-15',
    expiryDate: new Date(Date.now() + 110 * 24 * 3600 * 1000).toISOString(),
    renewalCost: 1850,
    reminderDaysBefore: 15,
    notes: 'Green Delta Insurance 1st party comprehensive.',
  });

  // Notifications
  globalStore.__motocare_mem_db.notifications.push(
    {
      _id: 'notif-1',
      ownerId: demoOwnerId,
      vehicleId: demoVehicleId,
      vehicleName: 'Phantom R15 V4',
      title: 'Drive Chain Cleaning Approaching',
      message: 'Drive chain lubrication is due in 150 KM (approx. 5 days).',
      type: 'WARNING',
      category: 'MAINTENANCE',
      isRead: false,
      link: `/dashboard/vehicles/${demoVehicleId}/maintenance`,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'notif-2',
      ownerId: demoOwnerId,
      vehicleId: demoVehicleId,
      vehicleName: 'Phantom R15 V4',
      title: 'Tax Token Expiration Reminder',
      message: 'Vehicle tax token expires in 47 days. Prepare renewal documents.',
      type: 'INFO',
      category: 'DOCUMENT',
      isRead: false,
      link: `/dashboard/vehicles/${demoVehicleId}/documents`,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    }
  );
}

export const memDb = globalStore.__motocare_mem_db;

export async function hasMongoConnection(): Promise<boolean> {
  try {
    const conn = await connectToDatabase();
    return !!conn;
  } catch (e) {
    return false;
  }
}
