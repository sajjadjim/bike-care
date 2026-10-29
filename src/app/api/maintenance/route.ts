import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/mongodb';
import { MaintenanceState } from '@/models/MaintenanceState';
import { MaintenanceHistory } from '@/models/MaintenanceHistory';
import { Vehicle } from '@/models/Vehicle';
import { OdometerReading } from '@/models/OdometerReading';
import { memDb, hasMongoConnection } from '@/services/dbStore';
import { maintenanceRecordSchema } from '@/lib/validations';
import {
  calculateRemainingKM,
  calculateDaysUntilExpiry,
  calculateMaintenanceStatus,
  calculateAverageDailyKM,
} from '@/lib/calculations/maintenance';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');
    if (!vehicleId) {
      return NextResponse.json({ error: 'vehicleId is required' }, { status: 400 });
    }

    const isConnected = await hasMongoConnection();
    let vehicle: any = null;
    let states: any[] = [];
    let history: any[] = [];
    let readings: any[] = [];

    if (isConnected) {
      await connectToDatabase();
      const mongoose = (await import('mongoose')).default;
      if (mongoose.Types.ObjectId.isValid(vehicleId)) {
        vehicle = await Vehicle.findOne({ _id: vehicleId, ownerId: authUser.uid });
      }
      if (!vehicle) {
        vehicle = await Vehicle.findOne({ ownerId: authUser.uid });
      }
      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found', states: [], history: [] }, { status: 404 });
      }
      const actualId = vehicle._id.toString();
      states = await MaintenanceState.find({ vehicleId: actualId, ownerId: authUser.uid });
      history = await MaintenanceHistory.find({ vehicleId: actualId, ownerId: authUser.uid }).sort({
        serviceDate: -1,
      });
      readings = await OdometerReading.find({ vehicleId: actualId, ownerId: authUser.uid });
    } else {
      vehicle = memDb.vehicles.get(vehicleId);
      if (!vehicle) {
        vehicle = Array.from(memDb.vehicles.values()).find((v) => v.ownerId === authUser.uid);
      }
      if (!vehicle || vehicle.ownerId !== authUser.uid) {
        return NextResponse.json({ error: 'Vehicle not found', states: [], history: [] }, { status: 404 });
      }
      const actualId = vehicle._id;
      states = Array.from(memDb.maintenanceStates.values()).filter(
        (s) => s.vehicleId === actualId && s.ownerId === authUser.uid
      );
      history = memDb.maintenanceHistory
        .filter((h) => h.vehicleId === actualId && h.ownerId === authUser.uid)
        .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
      readings = memDb.odometerReadings.filter(
        (r) => r.vehicleId === actualId && r.ownerId === authUser.uid
      );
    }

    const currentOdometer = vehicle.currentOdometer || 0;
    const avgStats = calculateAverageDailyKM(readings);

    // Enrich states with dynamic remaining KM, remaining days, and status
    const enrichedStates = states.map((state) => {
      const stateObj = state.toObject ? state.toObject() : { ...state };
      let remainingKM: number | null = null;
      let remainingDays: number | null = null;

      if (stateObj.nextDueOdometer !== undefined && stateObj.nextDueOdometer !== null) {
        remainingKM = stateObj.nextDueOdometer - currentOdometer;
      }

      if (stateObj.nextDueDate) {
        remainingDays = calculateDaysUntilExpiry(stateObj.nextDueDate);
      }

      const status = calculateMaintenanceStatus({
        remainingKM,
        remainingDays,
      });

      return {
        ...stateObj,
        remainingKM,
        remainingDays,
        status,
      };
    });

    return NextResponse.json({
      states: enrichedStates,
      history,
      vehicle,
      averageDailyKM: avgStats.averageDailyKM,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = maintenanceRecordSchema.parse(body);

    const isConnected = await hasMongoConnection();

    // Calculate next due odometer and date if interval provided
    let nextDueOdometer: number | undefined;
    let nextDueDate: Date | undefined;

    if (validated.intervalKM && validated.intervalKM > 0) {
      nextDueOdometer = validated.odometer + validated.intervalKM;
    }

    if (validated.intervalMonths && validated.intervalMonths > 0) {
      const date = new Date(validated.serviceDate);
      if (!isNaN(date.getTime())) {
        nextDueDate = new Date(date);
        nextDueDate.setMonth(nextDueDate.getMonth() + validated.intervalMonths);
      }
    }

    if (isConnected) {
      await connectToDatabase();
      const vehicle = await Vehicle.findOne({ _id: validated.vehicleId, ownerId: authUser.uid });
      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }

      // 1. SMART MAINTENANCE RECORD REPLACEMENT (Upsert based on vehicleId + partId + maintenanceTaskId)
      const updatedState = await MaintenanceState.findOneAndUpdate(
        {
          vehicleId: validated.vehicleId,
          partId: validated.partId,
          maintenanceTaskId: validated.maintenanceTaskId,
        },
        {
          ownerId: authUser.uid,
          vehicleId: validated.vehicleId,
          partId: validated.partId,
          partName: validated.partName,
          category: validated.category,
          maintenanceTaskId: validated.maintenanceTaskId,
          lastAction: validated.action,
          lastServiceDate: new Date(validated.serviceDate),
          lastServiceOdometer: validated.odometer,
          brand: validated.brand,
          partsCost: validated.partsCost,
          laborCost: validated.laborCost,
          totalCost: validated.totalCost || (validated.partsCost + validated.laborCost),
          notes: validated.notes,
          intervalKM: validated.intervalKM,
          intervalMonths: validated.intervalMonths,
          nextDueOdometer,
          nextDueDate,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // 2. Append to Maintenance History for audit trail
      await MaintenanceHistory.create({
        ownerId: authUser.uid,
        vehicleId: validated.vehicleId,
        partId: validated.partId,
        partName: validated.partName,
        category: validated.category,
        maintenanceTaskId: validated.maintenanceTaskId,
        action: validated.action,
        serviceDate: new Date(validated.serviceDate),
        odometer: validated.odometer,
        brand: validated.brand,
        partsCost: validated.partsCost,
        laborCost: validated.laborCost,
        totalCost: validated.totalCost || (validated.partsCost + validated.laborCost),
        notes: validated.notes,
      });

      // 3. Update vehicle current odometer if service odometer is higher
      if (validated.odometer > vehicle.currentOdometer) {
        vehicle.currentOdometer = validated.odometer;
        await vehicle.save();

        await OdometerReading.create({
          ownerId: authUser.uid,
          vehicleId: validated.vehicleId,
          reading: validated.odometer,
          recordedAt: new Date(validated.serviceDate),
          notes: `Updated automatically from ${validated.partName} service`,
        });
      }

      return NextResponse.json({ success: true, state: updatedState });
    } else {
      const vehicle = memDb.vehicles.get(validated.vehicleId);
      if (!vehicle || vehicle.ownerId !== authUser.uid) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }

      const stateKey = `${validated.vehicleId}:${validated.partId}:${validated.maintenanceTaskId}`;
      const stateObj = {
        _id: 'state-' + Date.now(),
        ownerId: authUser.uid,
        vehicleId: validated.vehicleId,
        partId: validated.partId,
        partName: validated.partName,
        category: validated.category,
        maintenanceTaskId: validated.maintenanceTaskId,
        lastAction: validated.action,
        lastServiceDate: new Date(validated.serviceDate).toISOString(),
        lastServiceOdometer: validated.odometer,
        brand: validated.brand,
        partsCost: validated.partsCost,
        laborCost: validated.laborCost,
        totalCost: validated.totalCost || (validated.partsCost + validated.laborCost),
        notes: validated.notes,
        intervalKM: validated.intervalKM,
        intervalMonths: validated.intervalMonths,
        nextDueOdometer,
        nextDueDate: nextDueDate ? nextDueDate.toISOString() : undefined,
      };

      // Upsert into memory store
      memDb.maintenanceStates.set(stateKey, stateObj);

      // Append to memory history
      memDb.maintenanceHistory.push({
        _id: 'hist-' + Date.now(),
        ownerId: authUser.uid,
        vehicleId: validated.vehicleId,
        partId: validated.partId,
        partName: validated.partName,
        category: validated.category,
        maintenanceTaskId: validated.maintenanceTaskId,
        action: validated.action,
        serviceDate: new Date(validated.serviceDate).toISOString(),
        odometer: validated.odometer,
        brand: validated.brand,
        partsCost: validated.partsCost,
        laborCost: validated.laborCost,
        totalCost: validated.totalCost || (validated.partsCost + validated.laborCost),
        notes: validated.notes,
        createdAt: new Date().toISOString(),
      });

      // Update vehicle odometer if higher
      if (validated.odometer > vehicle.currentOdometer) {
        vehicle.currentOdometer = validated.odometer;
        memDb.vehicles.set(validated.vehicleId, vehicle);
        memDb.odometerReadings.push({
          _id: 'odo-' + Date.now(),
          ownerId: authUser.uid,
          vehicleId: validated.vehicleId,
          reading: validated.odometer,
          recordedAt: new Date(validated.serviceDate).toISOString(),
          notes: `Updated automatically from ${validated.partName} service`,
        });
      }

      return NextResponse.json({ success: true, state: stateObj });
    }
  } catch (error: any) {
    console.error('Error saving maintenance record:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
