import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/mongodb';
import { VehicleDocumentRecord } from '@/models/VehicleDocument';
import { memDb, hasMongoConnection } from '@/services/dbStore';
import { vehicleDocumentSchema } from '@/lib/validations';
import { calculateDaysUntilExpiry } from '@/lib/calculations/maintenance';

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
    let docs: any[] = [];

    if (isConnected) {
      await connectToDatabase();
      docs = await VehicleDocumentRecord.find({ vehicleId, ownerId: authUser.uid }).sort({
        expiryDate: 1,
      });
    } else {
      docs = Array.from(memDb.documents.values())
        .filter((d) => d.vehicleId === vehicleId && d.ownerId === authUser.uid)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }

    const enriched = docs.map((doc) => {
      const docObj = doc.toObject ? doc.toObject() : { ...doc };
      const days = calculateDaysUntilExpiry(docObj.expiryDate);
      const reminderDays = docObj.reminderDaysBefore || 30;

      let status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' = 'VALID';
      if (days <= 0) {
        status = 'EXPIRED';
      } else if (days <= reminderDays) {
        status = 'EXPIRING_SOON';
      }

      return {
        ...docObj,
        remainingDays: days,
        status,
      };
    });

    return NextResponse.json({ documents: enriched });
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
    const validated = vehicleDocumentSchema.parse(body);

    const isConnected = await hasMongoConnection();

    if (isConnected) {
      await connectToDatabase();
      // Upsert by vehicleId + documentType so each document type has one active tracked validity
      const updatedDoc = await VehicleDocumentRecord.findOneAndUpdate(
        {
          vehicleId: validated.vehicleId,
          documentType: validated.documentType,
        },
        {
          ownerId: authUser.uid,
          ...validated,
          issueDate: validated.issueDate ? new Date(validated.issueDate) : undefined,
          expiryDate: new Date(validated.expiryDate),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return NextResponse.json({ success: true, document: updatedDoc });
    } else {
      const docKey = `${validated.vehicleId}:${validated.documentType}`;
      const docObj = {
        _id: 'doc-' + Date.now(),
        ownerId: authUser.uid,
        ...validated,
        issueDate: validated.issueDate,
        expiryDate: validated.expiryDate,
        updatedAt: new Date().toISOString(),
      };
      memDb.documents.set(docKey, docObj);
      return NextResponse.json({ success: true, document: docObj });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const vehicleId = searchParams.get('vehicleId');
    const docType = searchParams.get('docType');

    const isConnected = await hasMongoConnection();

    if (isConnected) {
      await connectToDatabase();
      if (id) {
        await VehicleDocumentRecord.findOneAndDelete({ _id: id, ownerId: authUser.uid });
      } else if (vehicleId && docType) {
        await VehicleDocumentRecord.findOneAndDelete({ vehicleId, documentType: docType, ownerId: authUser.uid });
      }
      return NextResponse.json({ success: true });
    } else {
      if (vehicleId && docType) {
        memDb.documents.delete(`${vehicleId}:${docType}`);
      } else if (id) {
        for (const [key, val] of memDb.documents.entries()) {
          if (val._id === id && val.ownerId === authUser.uid) {
            memDb.documents.delete(key);
            break;
          }
        }
      }
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
