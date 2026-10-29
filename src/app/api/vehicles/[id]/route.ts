import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/mongodb';
import { Vehicle } from '@/models/Vehicle';
import { memDb, hasMongoConnection } from '@/services/dbStore';
import { vehicleFormSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const isConnected = await hasMongoConnection();

    if (isConnected) {
      await connectToDatabase();
      const vehicle = await Vehicle.findOne({ _id: id, ownerId: authUser.uid });
      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }
      return NextResponse.json({ vehicle });
    } else {
      const vehicle = memDb.vehicles.get(id);
      if (!vehicle || vehicle.ownerId !== authUser.uid) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }
      return NextResponse.json({ vehicle });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = vehicleFormSchema.partial().parse(body);

    const isConnected = await hasMongoConnection();
    if (isConnected) {
      await connectToDatabase();
      const updated = await Vehicle.findOneAndUpdate(
        { _id: id, ownerId: authUser.uid },
        { $set: validated },
        { new: true }
      );
      if (!updated) {
        return NextResponse.json({ error: 'Vehicle not found or unauthorized' }, { status: 404 });
      }
      return NextResponse.json({ success: true, vehicle: updated });
    } else {
      const vehicle = memDb.vehicles.get(id);
      if (!vehicle || vehicle.ownerId !== authUser.uid) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }
      const newVehicle = { ...vehicle, ...validated, updatedAt: new Date().toISOString() };
      memDb.vehicles.set(id, newVehicle);
      return NextResponse.json({ success: true, vehicle: newVehicle });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const isConnected = await hasMongoConnection();

    if (isConnected) {
      await connectToDatabase();
      const res = await Vehicle.findOneAndDelete({ _id: id, ownerId: authUser.uid });
      if (!res) {
        return NextResponse.json({ error: 'Vehicle not found or unauthorized' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } else {
      const vehicle = memDb.vehicles.get(id);
      if (!vehicle || vehicle.ownerId !== authUser.uid) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }
      memDb.vehicles.delete(id);
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
