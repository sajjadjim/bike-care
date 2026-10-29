import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { memDb, hasMongoConnection } from '@/services/dbStore';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firebaseUid, fullName, email, avatar } = body;

    const uid = authUser.uid || firebaseUid;

    const isConnected = await hasMongoConnection();
    if (isConnected) {
      await connectToDatabase();
      const updatedUser = await User.findOneAndUpdate(
        { firebaseUid: uid },
        {
          firebaseUid: uid,
          fullName: fullName || authUser.name || 'Vehicle Owner',
          email: email || authUser.email || '',
          avatar: avatar || authUser.picture,
          lastLoginDate: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return NextResponse.json({ success: true, user: updatedUser });
    } else {
      // Dev memory store
      const userObj = {
        firebaseUid: uid,
        fullName: fullName || authUser.name || 'Vehicle Owner',
        email: email || authUser.email || '',
        avatar: avatar || authUser.picture,
        country: 'Bangladesh',
        currency: 'BDT',
        lastLoginDate: new Date(),
      };
      memDb.users.set(uid, userObj);
      return NextResponse.json({ success: true, user: userObj, mode: 'memory' });
    }
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
