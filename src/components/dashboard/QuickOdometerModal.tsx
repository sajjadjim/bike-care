'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import { Gauge, AlertTriangle, X, Check, ArrowRight } from 'lucide-react';

interface QuickOdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newKM: number) => void;
}

export function QuickOdometerModal({ isOpen, onClose, onSuccess }: QuickOdometerModalProps) {
  const { user, token } = useAuth();
  const { activeVehicle, updateActiveOdometer } = useVehicle();

  const [reading, setReading] = useState<number | string>(
    activeVehicle?.currentOdometer || ''
  );
  const [recordedAt, setRecordedAt] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');
  const [isCorrection, setIsCorrection] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !activeVehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numReading = Number(reading);

    if (isNaN(numReading) || numReading < 0) {
      setError('Please enter a valid positive odometer reading.');
      return;
    }

    if (numReading < activeVehicle.currentOdometer && !isCorrection) {
      setError(
        `Reading (${numReading} KM) is lower than current odometer (${activeVehicle.currentOdometer} KM). Please check "Odometer Correction" below and provide an explanation.`
      );
      setIsCorrection(true);
      return;
    }

    if (isCorrection && !correctionReason.trim()) {
      setError('Please provide a reason for correcting or lowering the odometer.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/odometer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
        body: JSON.stringify({
          vehicleId: activeVehicle._id,
          reading: numReading,
          recordedAt: new Date(recordedAt).toISOString(),
          notes,
          isCorrection,
          correctionReason: isCorrection ? correctionReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update odometer');
      }

      updateActiveOdometer(numReading);
      if (onSuccess) onSuccess(numReading);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit odometer reading');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Update Odometer</h3>
              <p className="text-xs text-slate-500">{activeVehicle.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Current Odometer:</span>
            <span className="font-bold text-slate-900 text-sm">
              {activeVehicle.currentOdometer.toLocaleString()} KM
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Odometer Reading (KM)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                required
                value={reading}
                onChange={(e) => setReading(e.target.value)}
                placeholder="e.g. 12500"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold"
              />
              <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                KM
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date of Reading
            </label>
            <input
              type="date"
              required
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Highway ride to Chittagong"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Odometer Correction Workflow */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isCorrection}
                onChange={(e) => setIsCorrection(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>This is an Odometer Correction (meter swapped or typo fix)</span>
            </label>

            {isCorrection && (
              <div className="mt-2.5">
                <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                  Correction Reason (Required for audit log)
                </label>
                <input
                  type="text"
                  required={isCorrection}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Speedometer console replacement under warranty"
                  className="w-full rounded-lg border border-amber-300 bg-amber-50/50 px-3 py-1.5 text-xs text-slate-900 focus:border-amber-600 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
