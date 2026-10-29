import { connectToDatabase } from '../src/lib/mongodb';
import { Vehicle } from '../src/models/Vehicle';
import { MaintenanceState } from '../src/models/MaintenanceState';
import { MaintenanceHistory } from '../src/models/MaintenanceHistory';
import { OdometerReading } from '../src/models/OdometerReading';
import { VehicleDocumentRecord } from '../src/models/VehicleDocument';
import { PartCatalog } from '../src/models/PartCatalog';
import { Notification } from '../src/models/Notification';
import { DEFAULT_PART_CATALOG } from '../src/constants/catalog';

async function seed() {
  console.log('Seeding MotoCare Database...');
  const conn = await connectToDatabase();
  if (!conn) {
    console.log('No MONGODB_URI found. Memory DB is already auto-seeded with sample data for dev/demo mode.');
    process.exit(0);
  }

  const demoUid = 'demo_user_pilot';

  // Seed parts catalog
  const catalogCount = await PartCatalog.countDocuments();
  if (catalogCount === 0) {
    console.log('Seeding parts catalog...');
    await PartCatalog.insertMany(DEFAULT_PART_CATALOG);
  }

  // Create demo bike
  const bike = await Vehicle.create({
    ownerId: demoUid,
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
    purchaseDate: new Date('2024-03-15'),
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    color: 'Racing Blue',
    notes: 'Primary commuter motorcycle.',
  });

  const bikeId = bike._id.toString();

  // Odometer readings
  await OdometerReading.create([
    { ownerId: demoUid, vehicleId: bikeId, reading: 10000, recordedAt: new Date(Date.now() - 50 * 86400000) },
    { ownerId: demoUid, vehicleId: bikeId, reading: 10600, recordedAt: new Date(Date.now() - 30 * 86400000) },
    { ownerId: demoUid, vehicleId: bikeId, reading: 11500, recordedAt: new Date() },
  ]);

  // Engine Oil state
  await MaintenanceState.create({
    ownerId: demoUid,
    vehicleId: bikeId,
    partId: 'mc-eng-oil',
    partName: 'Engine Oil',
    category: 'Engine',
    maintenanceTaskId: 'OIL_CHANGE',
    lastAction: 'REPLACED',
    lastServiceDate: new Date(Date.now() - 50 * 86400000),
    lastServiceOdometer: 10000,
    brand: 'Motul 7100 10W-40 Fully Synthetic',
    partsCost: 1550,
    laborCost: 150,
    totalCost: 1700,
    intervalKM: 3000,
    intervalMonths: 3,
    nextDueOdometer: 13000,
    nextDueDate: new Date(Date.now() + 40 * 86400000),
  });

  // Chain cleaning
  await MaintenanceState.create({
    ownerId: demoUid,
    vehicleId: bikeId,
    partId: 'mc-trn-chainclean',
    partName: 'Drive Chain Cleaning & Lube',
    category: 'Chain & Transmission',
    maintenanceTaskId: 'CLEAN',
    lastAction: 'CLEANED',
    lastServiceDate: new Date(Date.now() - 10 * 86400000),
    lastServiceOdometer: 11150,
    brand: 'Motul C1/C2 Chain Clean & Lube',
    partsCost: 200,
    laborCost: 100,
    totalCost: 300,
    intervalKM: 500,
    intervalMonths: 1,
    nextDueOdometer: 11650,
    nextDueDate: new Date(Date.now() + 20 * 86400000),
  });

  // Tax Token
  await VehicleDocumentRecord.create({
    ownerId: demoUid,
    vehicleId: bikeId,
    documentType: 'TAX_TOKEN',
    documentNumber: 'BRTA-TT-2024-99812',
    issueDate: new Date('2024-03-15'),
    expiryDate: new Date(Date.now() + 47 * 86400000),
    renewalCost: 2300,
    reminderDaysBefore: 30,
  });

  console.log('MotoCare Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
