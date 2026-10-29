import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { connectToDatabase } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { memDb, hasMongoConnection } from '@/services/dbStore';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isConnected = await hasMongoConnection();
    let notifications: any[] = [];

    if (isConnected) {
      await connectToDatabase();
      notifications = await Notification.find({ ownerId: authUser.uid }).sort({ createdAt: -1 });
    } else {
      notifications = memDb.notifications.filter((n) => n.ownerId === authUser.uid);
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, markAllRead } = body;

    const isConnected = await hasMongoConnection();

    if (isConnected) {
      await connectToDatabase();
      if (markAllRead) {
        await Notification.updateMany({ ownerId: authUser.uid, isRead: false }, { $set: { isRead: true } });
      } else if (id) {
        await Notification.findOneAndUpdate({ _id: id, ownerId: authUser.uid }, { $set: { isRead: true } });
      }
      return NextResponse.json({ success: true });
    } else {
      if (markAllRead) {
        memDb.notifications.forEach((n) => {
          if (n.ownerId === authUser.uid) n.isRead = true;
        });
      } else if (id) {
        const notif = memDb.notifications.find((n) => n._id === id && n.ownerId === authUser.uid);
        if (notif) notif.isRead = true;
      }
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
