'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import { QuickOdometerModal } from '@/components/dashboard/QuickOdometerModal';
import {
  Gauge,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  History,
  Calendar,
  ShieldAlert,
} from 'lucide-react';

export default function OdometerTrackerPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { user, token } = useAuth();
  const { activeVehicle } = useVehicle();

  const [readings, setReadings] = useState<any[]>([]);
  const [averageDailyKM, setAverageDailyKM] = useState(0);
  const [confidence, setConfidence] = useState<string>('none');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOdometerData = useCallback(async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/odometer?vehicleId=${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setReadings(data.readings || []);
        setAverageDailyKM(data.averageDailyKM || 0);
        setConfidence(data.confidence || 'none');
      }
    } catch (err) {
      console.error('Failed to load odometer data:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, token, user]);

  useEffect(() => {
    fetchOdometerData();
  }, [fetchOdometerData]);

  return (
    <div className="space-y-6">
      <QuickOdometerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchOdometerData()}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Smart Odometer & Mileage Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Calculates rolling average daily driving rate to predict upcoming maintenance with statistical accuracy.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Update Odometer
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Current Odometer</span>
            <Gauge className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {activeVehicle?.currentOdometer.toLocaleString()} KM
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Verified across maintenance logs
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Rolling Daily Average</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600">
            {averageDailyKM > 0 ? `${averageDailyKM} KM/day` : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Confidence: <strong className="capitalize text-slate-600">{confidence}</strong>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Logged Readings</span>
            <History className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{readings.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Chronological audit trail
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Odometer Reading History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes timestamps, calculated differences, and correction audit explanations
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Recorded Date</th>
                <th className="pb-3">Odometer (KM)</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Notes / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {readings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No odometer updates recorded yet.
                  </td>
                </tr>
              ) : (
                readings.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50">
                    <td className="py-3 text-slate-600">
                      {new Date(r.recordedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {r.reading?.toLocaleString()} KM
                    </td>
                    <td className="py-3">
                      {r.isCorrection ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          <ShieldAlert className="h-3 w-3" />
                          Correction
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-500">
                      {r.correctionReason ? (
                        <span className="text-amber-900 font-medium">
                          {r.correctionReason}
                        </span>
                      ) : (
                        r.notes || '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
