import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/mongodb';
import { MaintenanceHistory } from '@/models/MaintenanceHistory';
import { MaintenanceState } from '@/models/MaintenanceState';
import { Vehicle } from '@/models/Vehicle';
import { memDb, hasMongoConnection } from '@/services/dbStore';
import { calculateExpenseAnalytics } from '@/lib/calculations/maintenance';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');

    const isConnected = await hasMongoConnection();
    let records: any[] = [];
    let vehicle: any = null;

    if (isConnected) {
      await connectToDatabase();
      const filter: any = { ownerId: authUser.uid };
      if (vehicleId) filter.vehicleId = vehicleId;

      records = await MaintenanceHistory.find(filter).sort({ serviceDate: -1 });

      // If no history exists yet, aggregate from maintenanceStates
      if (records.length === 0) {
        records = await MaintenanceState.find(filter);
      }

      if (vehicleId) {
        vehicle = await Vehicle.findOne({ _id: vehicleId, ownerId: authUser.uid });
      }
    } else {
      if (vehicleId) {
        records = memDb.maintenanceHistory.filter(
          (h) => h.vehicleId === vehicleId && h.ownerId === authUser.uid
        );
        if (records.length === 0) {
          records = Array.from(memDb.maintenanceStates.values()).filter(
            (s) => s.vehicleId === vehicleId && s.ownerId === authUser.uid
          );
        }
        vehicle = memDb.vehicles.get(vehicleId);
      } else {
        records = memDb.maintenanceHistory.filter((h) => h.ownerId === authUser.uid);
        if (records.length === 0) {
          records = Array.from(memDb.maintenanceStates.values()).filter(
            (s) => s.ownerId === authUser.uid
          );
        }
      }
    }

    const analytics = calculateExpenseAnalytics(records);

    // Calculate cost per kilometer if vehicle odometer > 0
    let costPerKM = 0;
    if (vehicle && vehicle.currentOdometer > 0) {
      costPerKM = Math.round((analytics.totalExpense / vehicle.currentOdometer) * 100) / 100;
    }

    return NextResponse.json({
      currency: 'BDT',
      currencySymbol: '৳',
      ...analytics,
      costPerKM,
      recordCount: records.length,
      records: records.slice(0, 50),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
