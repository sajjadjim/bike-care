import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/mongodb';
import { PartCatalog } from '@/models/PartCatalog';
import { DEFAULT_PART_CATALOG } from '@/constants/catalog';
import { memDb, hasMongoConnection } from '@/services/dbStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleType = searchParams.get('type');
    const category = searchParams.get('category');
    const query = searchParams.get('q')?.toLowerCase();

    const isConnected = await hasMongoConnection();
    let parts: any[] = [];

    if (isConnected) {
      await connectToDatabase();
      const filter: any = {};
      if (vehicleType) {
        filter.$or = [{ vehicleType }, { vehicleType: 'all' }];
      }
      if (category) {
        filter.category = category;
      }
      parts = await PartCatalog.find(filter);

      // If DB catalog is empty, populate from default preset
      if (parts.length === 0) {
        parts = DEFAULT_PART_CATALOG;
      }
    } else {
      parts = memDb.partCatalog;
      if (vehicleType) {
        parts = parts.filter((p) => p.vehicleType === vehicleType || p.vehicleType === 'all');
      }
      if (category) {
        parts = parts.filter((p) => p.category === category);
      }
    }

    if (query) {
      parts = parts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ parts });
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
    const {
      name,
      vehicleType,
      category,
      description,
      suggestedInspectionIntervalKM,
      suggestedReplacementIntervalKM,
      defaultActions,
    } = body;

    if (!name || !vehicleType || !category) {
      return NextResponse.json({ error: 'Name, vehicleType, and category are required' }, { status: 400 });
    }

    const partId = `custom-${Date.now()}`;
    const newPart = {
      partId,
      name,
      vehicleType,
      category,
      description,
      suggestedInspectionIntervalKM: suggestedInspectionIntervalKM ? Number(suggestedInspectionIntervalKM) : undefined,
      suggestedReplacementIntervalKM: suggestedReplacementIntervalKM ? Number(suggestedReplacementIntervalKM) : undefined,
      defaultActions: defaultActions && defaultActions.length ? defaultActions : ['REPLACED', 'INSPECTED', 'CLEANED'],
      isCustom: true,
      ownerId: authUser.uid,
    };

    const isConnected = await hasMongoConnection();
    if (isConnected) {
      await connectToDatabase();
      const saved = await PartCatalog.create(newPart);
      return NextResponse.json({ success: true, part: saved }, { status: 201 });
    } else {
      memDb.partCatalog.push(newPart);
      return NextResponse.json({ success: true, part: newPart }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
