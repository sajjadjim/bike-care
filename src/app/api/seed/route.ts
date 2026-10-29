import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/mongodb';
import { Vehicle } from '@/models/Vehicle';
import { MaintenanceState } from '@/models/MaintenanceState';
import { MaintenanceHistory } from '@/models/MaintenanceHistory';
import { OdometerReading } from '@/models/OdometerReading';
import { VehicleDocumentRecord } from '@/models/VehicleDocument';
import { Notification } from '@/models/Notification';
import { PartCatalog } from '@/models/PartCatalog';
import { DEFAULT_PART_CATALOG } from '@/constants/catalog';
import { memDb, hasMongoConnection } from '@/services/dbStore';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = authUser.uid;
    const isConnected = await hasMongoConnection();

    if (isConnected) {
      await connectToDatabase();

      // Seed default catalog if empty
      const catalogCount = await PartCatalog.countDocuments();
      if (catalogCount === 0) {
        await PartCatalog.insertMany(DEFAULT_PART_CATALOG);
      }

      // 1. Motorcycle
      const bike = await Vehicle.create({
        ownerId: uid,
        name: 'Yamaha R15 V4 Racing Blue',
        type: 'motorcycle',
        manufacturer: 'Yamaha',
        model: 'R15 V4',
        year: 2024,
        registrationYear: 2024,
        engineCC: 155,
        fuelType: 'Octane',
        registrationNumber: 'Dhaka Metro LA-33-8821',
        currentOdometer: 11500,
        purchaseDate: new Date('2024-02-10'),
        color: 'Racing Blue',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
        notes: 'Equipped with quickshifter, traction control, and dual-channel ABS.',
      });

      const bikeId = bike._id.toString();

      // Readings
      await OdometerReading.create([
        { ownerId: uid, vehicleId: bikeId, reading: 10000, recordedAt: new Date(Date.now() - 45 * 86400000) },
        { ownerId: uid, vehicleId: bikeId, reading: 10800, recordedAt: new Date(Date.now() - 20 * 86400000) },
        { ownerId: uid, vehicleId: bikeId, reading: 11500, recordedAt: new Date() },
      ]);

      // Engine oil state
      await MaintenanceState.create({
        ownerId: uid,
        vehicleId: bikeId,
        partId: 'mc-eng-oil',
        partName: 'Engine Oil',
        category: 'Engine',
        maintenanceTaskId: 'OIL_CHANGE',
        lastAction: 'REPLACED',
        lastServiceDate: new Date(Date.now() - 45 * 86400000),
        lastServiceOdometer: 10000,
        brand: 'Motul 7100 10W-40 Fully Synthetic',
        partsCost: 1550,
        laborCost: 150,
        totalCost: 1700,
        notes: 'Changed with OEM filter. Engine revving smoothly.',
        intervalKM: 3000,
        intervalMonths: 3,
        nextDueOdometer: 13000,
        nextDueDate: new Date(Date.now() + 45 * 86400000),
      });

      // Chain cleaning state
      await MaintenanceState.create({
        ownerId: uid,
        vehicleId: bikeId,
        partId: 'mc-trn-chainclean',
        partName: 'Drive Chain Cleaning & Lube',
        category: 'Chain & Transmission',
        maintenanceTaskId: 'CLEAN',
        lastAction: 'CLEANED',
        lastServiceDate: new Date(Date.now() - 10 * 86400000),
        lastServiceOdometer: 11200,
        brand: 'Motul C2 Road Chain Lube',
        partsCost: 200,
        laborCost: 100,
        totalCost: 300,
        notes: 'Full degreasing and lube spray applied.',
        intervalKM: 500,
        intervalMonths: 1,
        nextDueOdometer: 11700,
        nextDueDate: new Date(Date.now() + 20 * 86400000),
      });

      // Documents
      await VehicleDocumentRecord.create([
        {
          ownerId: uid,
          vehicleId: bikeId,
          documentType: 'TAX_TOKEN',
          documentNumber: 'BRTA-DH-2024-9128',
          issueDate: new Date('2024-02-10'),
          expiryDate: new Date(Date.now() + 47 * 86400000),
          renewalCost: 2300,
          reminderDaysBefore: 30,
        },
        {
          ownerId: uid,
          vehicleId: bikeId,
          documentType: 'INSURANCE',
          documentNumber: 'INS-2024-00129',
          issueDate: new Date('2024-02-10'),
          expiryDate: new Date(Date.now() + 180 * 86400000),
          renewalCost: 1800,
          reminderDaysBefore: 15,
        },
      ]);

      // Notifications
      await Notification.create({
        ownerId: uid,
        vehicleId: bikeId,
        vehicleName: 'Yamaha R15 V4',
        title: 'Drive Chain Service Approaching',
        message: 'Chain cleaning is due in 200 KM.',
        type: 'WARNING',
        category: 'MAINTENANCE',
        link: `/dashboard/vehicles/${bikeId}/maintenance`,
      });

      return NextResponse.json({ success: true, message: 'Database seeded successfully', vehicleId: bikeId });
    } else {
      // Memory DB is already auto-seeded with Phantom R15 V4
      return NextResponse.json({ success: true, message: 'Memory store ready with sample data' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
