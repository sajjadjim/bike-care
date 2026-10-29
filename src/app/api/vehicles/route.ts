import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/mongodb';
import { Vehicle } from '@/models/Vehicle';
import { OdometerReading } from '@/models/OdometerReading';
import { memDb, hasMongoConnection } from '@/services/dbStore';
import { vehicleFormSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isConnected = await hasMongoConnection();
    if (isConnected) {
      await connectToDatabase();
      const vehicles = await Vehicle.find({ ownerId: authUser.uid }).sort({ createdAt: -1 });
      return NextResponse.json({ vehicles });
    } else {
      const vehicles = Array.from(memDb.vehicles.values()).filter(
        (v) => v.ownerId === authUser.uid
      );
      return NextResponse.json({ vehicles, mode: 'memory' });
    }
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
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
    const validated = vehicleFormSchema.parse(body);

    const isConnected = await hasMongoConnection();
    if (isConnected) {
      await connectToDatabase();
      const newVehicle = await Vehicle.create({
        ...validated,
        ownerId: authUser.uid,
      });

      // Also record initial odometer reading
      if (validated.currentOdometer > 0) {
        await OdometerReading.create({
          ownerId: authUser.uid,
          vehicleId: newVehicle._id.toString(),
          reading: validated.currentOdometer,
          recordedAt: new Date(),
          notes: 'Initial registration odometer reading',
        });
      }

      return NextResponse.json({ success: true, vehicle: newVehicle }, { status: 201 });
    } else {
      const id = 'v-' + Date.now();
      const vehicleObj = {
        _id: id,
        ...validated,
        ownerId: authUser.uid,
        createdAt: new Date().toISOString(),
      };
      memDb.vehicles.set(id, vehicleObj);

      // Record initial odometer
      memDb.odometerReadings.push({
        _id: 'odo-' + Date.now(),
        ownerId: authUser.uid,
        vehicleId: id,
        reading: validated.currentOdometer,
        recordedAt: new Date().toISOString(),
        notes: 'Initial registration odometer reading',
      });

      return NextResponse.json({ success: true, vehicle: vehicleObj, mode: 'memory' }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 400 });
  }
}
