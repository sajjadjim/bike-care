'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function NotificationsPage() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Engine oil change reminders, overdue service alerts, and BRTA document validity notifications.
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <CheckCheck className="h-4 w-4 text-blue-600" />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            No notifications at this time. All vehicle maintenance schedules are up to date!
          </div>
        ) : (
          notifications.map((notif) => {
            const isDanger = notif.type === 'DANGER';
            const isWarning = notif.type === 'WARNING';

            return (
              <div
                key={notif._id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  !notif.isRead ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isDanger
                        ? 'bg-red-100 text-red-600'
                        : isWarning
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {isDanger ? (
                      <AlertOctagon className="h-4 w-4" />
                    ) : isWarning ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Info className="h-4 w-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-xs font-bold ${
                          !notif.isRead ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                      <span>{new Date(notif.createdAt).toLocaleDateString('en-GB')}</span>
                      {notif.vehicleName && (
                        <>
                          <span>&bull;</span>
                          <span className="font-semibold text-slate-600">
                            {notif.vehicleName}
                          </span>
                        </>
                      )}
                      {notif.link && (
                        <>
                          <span>&bull;</span>
                          <Link
                            href={notif.link}
                            className="font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            Resolve Issue <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkSingleRead(notif._id)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
