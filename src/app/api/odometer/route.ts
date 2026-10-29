import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/mongodb';
import { OdometerReading } from '@/models/OdometerReading';
import { Vehicle } from '@/models/Vehicle';
import { memDb, hasMongoConnection } from '@/services/dbStore';
import { odometerUpdateSchema } from '@/lib/validations';
import { calculateAverageDailyKM } from '@/lib/calculations/maintenance';

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
    let readings: any[] = [];

    if (isConnected) {
      await connectToDatabase();
      readings = await OdometerReading.find({
        vehicleId,
        ownerId: authUser.uid,
      }).sort({ recordedAt: -1 });
    } else {
      readings = memDb.odometerReadings
        .filter((r) => r.vehicleId === vehicleId && r.ownerId === authUser.uid)
        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    }

    const calculation = calculateAverageDailyKM(readings);

    return NextResponse.json({
      readings,
      averageDailyKM: calculation.averageDailyKM,
      confidence: calculation.confidence,
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
    const { vehicleId, ...rest } = body;
    if (!vehicleId) {
      return NextResponse.json({ error: 'vehicleId is required' }, { status: 400 });
    }

    const validated = odometerUpdateSchema.parse(rest);

    const isConnected = await hasMongoConnection();

    if (isConnected) {
      await connectToDatabase();
      const vehicle = await Vehicle.findOne({ _id: vehicleId, ownerId: authUser.uid });
      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }

      // Check for lower reading without correction workflow
      if (validated.reading < vehicle.currentOdometer && !validated.isCorrection) {
        return NextResponse.json(
          {
            error:
              'New reading is lower than current vehicle odometer. Please use the Odometer Correction Workflow with a valid reason.',
            requiresCorrection: true,
            currentOdometer: vehicle.currentOdometer,
          },
          { status: 422 }
        );
      }

      if (validated.isCorrection && !validated.correctionReason) {
        return NextResponse.json(
          { error: 'Correction reason is required when adjusting or lowering odometer.' },
          { status: 400 }
        );
      }

      const readingDoc = await OdometerReading.create({
        ownerId: authUser.uid,
        vehicleId,
        reading: validated.reading,
        recordedAt: new Date(validated.recordedAt),
        notes: validated.notes,
        isCorrection: validated.isCorrection,
        correctionReason: validated.correctionReason,
      });

      // Update vehicle's current odometer if new or corrected
      vehicle.currentOdometer = validated.reading;
      await vehicle.save();

      return NextResponse.json({ success: true, reading: readingDoc, currentOdometer: vehicle.currentOdometer });
    } else {
      const vehicle = memDb.vehicles.get(vehicleId);
      if (!vehicle || vehicle.ownerId !== authUser.uid) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }

      if (validated.reading < vehicle.currentOdometer && !validated.isCorrection) {
        return NextResponse.json(
          {
            error:
              'New reading is lower than current vehicle odometer. Please use the Odometer Correction Workflow with a valid reason.',
            requiresCorrection: true,
            currentOdometer: vehicle.currentOdometer,
          },
          { status: 422 }
        );
      }

      if (validated.isCorrection && !validated.correctionReason) {
        return NextResponse.json(
          { error: 'Correction reason is required when adjusting or lowering odometer.' },
          { status: 400 }
        );
      }

      const readingDoc = {
        _id: 'odo-' + Date.now(),
        ownerId: authUser.uid,
        vehicleId,
        reading: validated.reading,
        recordedAt: new Date(validated.recordedAt).toISOString(),
        notes: validated.notes,
        isCorrection: validated.isCorrection,
        correctionReason: validated.correctionReason,
        createdAt: new Date().toISOString(),
      };

      memDb.odometerReadings.push(readingDoc);
      vehicle.currentOdometer = validated.reading;
      memDb.vehicles.set(vehicleId, vehicle);

      return NextResponse.json({ success: true, reading: readingDoc, currentOdometer: vehicle.currentOdometer });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
