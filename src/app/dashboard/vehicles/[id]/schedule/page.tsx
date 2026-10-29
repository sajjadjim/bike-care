'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import {
  Calendar,
  Clock,
  Wrench,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function ScheduleMatrixPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { user, token } = useAuth();
  const { activeVehicle } = useVehicle();

  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = useCallback(async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/maintenance?vehicleId=${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStates(data.states || []);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, token, user]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Sort states: overdue first, then approaching, then healthy
  const sorted = [...states].sort((a, b) => {
    const order = { RED: 0, YELLOW: 1, GREEN: 2, GRAY: 3 };
    const orderA = order[a.status as keyof typeof order] ?? 4;
    const orderB = order[b.status as keyof typeof order] ?? 4;
    if (orderA !== orderB) return orderA - orderB;
    return (a.remainingKM || 999999) - (b.remainingKM || 999999);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Upcoming Maintenance Schedule Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chronological service forecast based on distance thresholds and calendar deadlines.
          </p>
        </div>
        <Link
          href={`/dashboard/vehicles/${vehicleId}/maintenance/add`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors"
        >
          Add Service Task
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Component Maintenance Forecast</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Current Odometer: <strong>{activeVehicle?.currentOdometer.toLocaleString()} KM</strong>
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {sorted.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No scheduled maintenance tasks configured yet.
            </div>
          ) : (
            sorted.map((item) => {
              const isOverdue = item.status === 'RED';
              const isApproaching = item.status === 'YELLOW';

              return (
                <div
                  key={item._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isOverdue
                          ? 'bg-red-100 text-red-600'
                          : isApproaching
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {isOverdue ? (
                        <AlertOctagon className="h-5 w-5" />
                      ) : isApproaching ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {item.partName}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Last performed: {item.lastAction} at{' '}
                        {item.lastServiceOdometer?.toLocaleString()} KM (
                        {new Date(item.lastServiceDate).toLocaleDateString('en-GB')})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                    <div>
                      <div
                        className={`text-sm font-bold font-mono ${
                          isOverdue
                            ? 'text-red-600'
                            : isApproaching
                            ? 'text-amber-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {item.remainingKM !== null && item.remainingKM !== undefined
                          ? item.remainingKM <= 0
                            ? `Overdue by ${Math.abs(item.remainingKM)} KM`
                            : `${item.remainingKM.toLocaleString()} KM Remaining`
                          : 'Manual schedule'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.nextDueOdometer
                          ? `Due at ${item.nextDueOdometer.toLocaleString()} KM`
                          : '—'}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        isOverdue
                          ? 'bg-red-100 text-red-700'
                          : isApproaching
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isOverdue ? 'OVERDUE' : isApproaching ? 'APPROACHING' : 'NOT DUE'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
