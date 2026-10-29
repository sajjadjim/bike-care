import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/mongodb';
import { MaintenanceState } from '@/models/MaintenanceState';
import { MaintenanceHistory } from '@/models/MaintenanceHistory';
import { Vehicle } from '@/models/Vehicle';
import { OdometerReading } from '@/models/OdometerReading';
import { memDb, hasMongoConnection } from '@/services/dbStore';
import { engineOilChangeSchema } from '@/lib/validations';
import { POPULAR_OIL_PRODUCTS } from '@/constants/catalog';
import {
  calculateAverageDailyKM,
  calculateDistanceSinceService,
  calculateRemainingKM,
  calculateEstimatedServiceDate,
  calculateOilUsagePercentage,
  calculateMaintenanceStatus,
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
    let oilState: any = null;
    let oilHistory: any[] = [];
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
        return NextResponse.json({ error: 'Vehicle not found', oilState: null, history: [] }, { status: 404 });
      }

      const actualId = vehicle._id.toString();
      oilState = await MaintenanceState.findOne({
        vehicleId: actualId,
        ownerId: authUser.uid,
        maintenanceTaskId: 'OIL_CHANGE',
      });

      oilHistory = await MaintenanceHistory.find({
        vehicleId: actualId,
        ownerId: authUser.uid,
        maintenanceTaskId: 'OIL_CHANGE',
      }).sort({ serviceDate: -1 });

      readings = await OdometerReading.find({ vehicleId: actualId, ownerId: authUser.uid });
    } else {
      vehicle = memDb.vehicles.get(vehicleId);
      if (!vehicle) {
        vehicle = Array.from(memDb.vehicles.values()).find((v) => v.ownerId === authUser.uid);
      }
      if (!vehicle || vehicle.ownerId !== authUser.uid) {
        return NextResponse.json({ error: 'Vehicle not found', oilState: null, history: [] }, { status: 404 });
      }

      const actualId = vehicle._id;
      const stateKey = `${actualId}:${vehicle.type === 'motorcycle' ? 'mc-eng-oil' : 'car-eng-oil'}:OIL_CHANGE`;
      oilState = memDb.maintenanceStates.get(stateKey);

      oilHistory = memDb.maintenanceHistory
        .filter((h) => h.vehicleId === actualId && h.ownerId === authUser.uid && h.maintenanceTaskId === 'OIL_CHANGE')
        .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());

      readings = memDb.odometerReadings.filter((r) => r.vehicleId === actualId && r.ownerId === authUser.uid);
    }

    const currentOdometer = vehicle.currentOdometer || 0;
    const avgStats = calculateAverageDailyKM(readings);

    let summary: any = null;

    if (oilState) {
      const stateObj = oilState.toObject ? oilState.toObject() : { ...oilState };
      const lastServiceOdometer = stateObj.lastServiceOdometer || 0;
      const intervalKM = stateObj.intervalKM || 3000;
      const intervalMonths = stateObj.intervalMonths || 3;
      const distanceSince = calculateDistanceSinceService(currentOdometer, lastServiceOdometer);
      const remainingKM = calculateRemainingKM(currentOdometer, lastServiceOdometer, intervalKM);
      const usagePercentage = calculateOilUsagePercentage(currentOdometer, lastServiceOdometer, intervalKM);

      const prediction = calculateEstimatedServiceDate({
        currentOdometer,
        lastServiceOdometer,
        intervalKM,
        lastServiceDate: stateObj.lastServiceDate,
        intervalMonths,
        averageDailyKM: avgStats.averageDailyKM,
      });

      const status = calculateMaintenanceStatus({
        remainingKM,
        remainingDays: prediction.daysRemaining,
      });

      summary = {
        ...stateObj,
        currentOdometer,
        distanceSince,
        remainingKM,
        usagePercentage,
        prediction,
        status,
        averageDailyKM: avgStats.averageDailyKM,
        confidence: avgStats.confidence,
      };
    }

    // Filter compatible oil products for vehicle type
    const compatibleOils = POPULAR_OIL_PRODUCTS.filter((p) =>
      p.compatibleVehicleTypes.includes(vehicle.type)
    );

    return NextResponse.json({
      vehicle,
      oilState: summary,
      history: oilHistory,
      compatibleOils,
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
    const validated = engineOilChangeSchema.parse(body);

    const isConnected = await hasMongoConnection();

    const nextDueOdometer = validated.odometerAtChange + validated.recommendedIntervalKM;
    const changeDate = new Date(validated.oilChangeDate);
    const nextDueDate = new Date(changeDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + validated.recommendedIntervalMonths);

    const fullBrandName = `${validated.oilBrand} ${validated.oilProductName} (${validated.viscosity} ${validated.oilType})`;
    const totalCost = validated.oilPrice + validated.serviceCharge;

    if (isConnected) {
      await connectToDatabase();
      const vehicle = await Vehicle.findOne({ _id: validated.vehicleId, ownerId: authUser.uid });
      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }

      const partId = vehicle.type === 'motorcycle' ? 'mc-eng-oil' : 'car-eng-oil';

      // Smart State Replacement
      const updatedState = await MaintenanceState.findOneAndUpdate(
        {
          vehicleId: validated.vehicleId,
          partId,
          maintenanceTaskId: 'OIL_CHANGE',
        },
        {
          ownerId: authUser.uid,
          vehicleId: validated.vehicleId,
          partId,
          partName: 'Engine Oil',
          category: 'Engine',
          maintenanceTaskId: 'OIL_CHANGE',
          lastAction: 'REPLACED',
          lastServiceDate: changeDate,
          lastServiceOdometer: validated.odometerAtChange,
          brand: fullBrandName,
          partsCost: validated.oilPrice,
          laborCost: validated.serviceCharge,
          totalCost,
          notes: `${validated.oilQuantity}L oil changed. ${validated.notes || ''}`.trim(),
          intervalKM: validated.recommendedIntervalKM,
          intervalMonths: validated.recommendedIntervalMonths,
          nextDueOdometer,
          nextDueDate,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Audit history
      await MaintenanceHistory.create({
        ownerId: authUser.uid,
        vehicleId: validated.vehicleId,
        partId,
        partName: 'Engine Oil',
        category: 'Engine',
        maintenanceTaskId: 'OIL_CHANGE',
        action: 'REPLACED',
        serviceDate: changeDate,
        odometer: validated.odometerAtChange,
        brand: fullBrandName,
        partsCost: validated.oilPrice,
        laborCost: validated.serviceCharge,
        totalCost,
        notes: `${validated.oilQuantity}L changed. ${validated.notes || ''}`.trim(),
      });

      // Update vehicle odometer if higher
      if (validated.odometerAtChange > vehicle.currentOdometer) {
        vehicle.currentOdometer = validated.odometerAtChange;
        await vehicle.save();
        await OdometerReading.create({
          ownerId: authUser.uid,
          vehicleId: validated.vehicleId,
          reading: validated.odometerAtChange,
          recordedAt: changeDate,
          notes: 'Recorded at Engine Oil change',
        });
      }

      return NextResponse.json({ success: true, state: updatedState });
    } else {
      const vehicle = memDb.vehicles.get(validated.vehicleId);
      if (!vehicle || vehicle.ownerId !== authUser.uid) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }

      const partId = vehicle.type === 'motorcycle' ? 'mc-eng-oil' : 'car-eng-oil';
      const stateKey = `${validated.vehicleId}:${partId}:OIL_CHANGE`;

      const stateObj = {
        _id: 'oil-state-' + Date.now(),
        ownerId: authUser.uid,
        vehicleId: validated.vehicleId,
        partId,
        partName: 'Engine Oil',
        category: 'Engine',
        maintenanceTaskId: 'OIL_CHANGE',
        lastAction: 'REPLACED',
        lastServiceDate: changeDate.toISOString(),
        lastServiceOdometer: validated.odometerAtChange,
        brand: fullBrandName,
        partsCost: validated.oilPrice,
        laborCost: validated.serviceCharge,
        totalCost,
        notes: `${validated.oilQuantity}L oil changed. ${validated.notes || ''}`.trim(),
        intervalKM: validated.recommendedIntervalKM,
        intervalMonths: validated.recommendedIntervalMonths,
        nextDueOdometer,
        nextDueDate: nextDueDate.toISOString(),
      };

      memDb.maintenanceStates.set(stateKey, stateObj);

      memDb.maintenanceHistory.push({
        _id: 'hist-oil-' + Date.now(),
        ownerId: authUser.uid,
        vehicleId: validated.vehicleId,
        partId,
        partName: 'Engine Oil',
        category: 'Engine',
        maintenanceTaskId: 'OIL_CHANGE',
        action: 'REPLACED',
        serviceDate: changeDate.toISOString(),
        odometer: validated.odometerAtChange,
        brand: fullBrandName,
        partsCost: validated.oilPrice,
        laborCost: validated.serviceCharge,
        totalCost,
        notes: `${validated.oilQuantity}L changed. ${validated.notes || ''}`.trim(),
        createdAt: new Date().toISOString(),
      });

      if (validated.odometerAtChange > vehicle.currentOdometer) {
        vehicle.currentOdometer = validated.odometerAtChange;
        memDb.vehicles.set(validated.vehicleId, vehicle);
        memDb.odometerReadings.push({
          _id: 'odo-' + Date.now(),
          ownerId: authUser.uid,
          vehicleId: validated.vehicleId,
          reading: validated.odometerAtChange,
          recordedAt: changeDate.toISOString(),
          notes: 'Recorded at Engine Oil change',
        });
      }

      return NextResponse.json({ success: true, state: stateObj });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
