'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import {
  Droplets,
  PlusCircle,
  Calendar,
  Gauge,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  HelpCircle,
  X,
} from 'lucide-react';

export default function EngineOilPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { user, token } = useAuth();
  const { activeVehicle, refreshVehicles } = useVehicle();

  const [loading, setLoading] = useState(true);
  const [oilSummary, setOilSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [compatibleOils, setCompatibleOils] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Modal form states
  const [oilBrand, setOilBrand] = useState('Motul');
  const [oilProductName, setOilProductName] = useState('7100 4T');
  const [viscosity, setViscosity] = useState('10W-40');
  const [oilType, setOilType] = useState<'Mineral' | 'Semi-Synthetic' | 'Fully Synthetic'>('Fully Synthetic');
  const [oilQuantity, setOilQuantity] = useState<number | string>(1.0);
  const [oilChangeDate, setOilChangeDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [odometerAtChange, setOdometerAtChange] = useState<number | string>(
    activeVehicle?.currentOdometer || ''
  );
  const [recommendedIntervalKM, setRecommendedIntervalKM] = useState<number | string>(3000);
  const [recommendedIntervalMonths, setRecommendedIntervalMonths] = useState<number | string>(3);
  const [oilPrice, setOilPrice] = useState<number | string>(1500);
  const [serviceCharge, setServiceCharge] = useState<number | string>(100);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/engine-oil?vehicleId=${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setOilSummary(data.oilState || null);
        setHistory(data.history || []);
        setCompatibleOils(data.compatibleOils || []);
      }
    } catch (err) {
      console.error('Failed to load oil status:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, token, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectPreset = (p: any) => {
    setOilBrand(p.brand);
    setOilProductName(p.productName);
    setViscosity(p.viscosity);
    setOilType(p.oilType);
    setRecommendedIntervalKM(p.recommendedIntervalKM);
    setRecommendedIntervalMonths(p.recommendedIntervalMonths);
  };

  const handleSaveOilChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        vehicleId,
        oilBrand,
        oilProductName,
        viscosity,
        oilType,
        oilQuantity: Number(oilQuantity) || 1,
        oilChangeDate,
        odometerAtChange: Number(odometerAtChange),
        recommendedIntervalKM: Number(recommendedIntervalKM),
        recommendedIntervalMonths: Number(recommendedIntervalMonths),
        oilPrice: Number(oilPrice) || 0,
        serviceCharge: Number(serviceCharge) || 0,
        notes,
      };

      const res = await fetch('/api/engine-oil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record oil change');
      }

      setModalOpen(false);
      await refreshVehicles();
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit oil change');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Engine Oil Management System
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Precision monitoring of oil degradation, remaining service distance, and automated predictive scheduling.
          </p>
        </div>
        <button
          onClick={() => {
            setOdometerAtChange(activeVehicle?.currentOdometer || '');
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Log Oil Change
        </button>
      </div>

      {/* Main Status Showcase */}
      {oilSummary ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gauge & Progress */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{oilSummary.brand}</h3>
                  <div className="text-xs text-slate-500">
                    Active engine oil batch &bull; Service interval: {oilSummary.intervalKM?.toLocaleString()} KM
                  </div>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                  oilSummary.status === 'RED'
                    ? 'bg-red-100 text-red-700'
                    : oilSummary.status === 'YELLOW'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {oilSummary.status === 'RED'
                  ? 'CHANGE OVERDUE'
                  : oilSummary.status === 'YELLOW'
                  ? 'SERVICE DUE SOON'
                  : 'HEALTHY'}
              </span>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-xs text-slate-500">Oil Life Depletion</span>
                  <div className="text-3xl font-black text-slate-900">
                    {oilSummary.usagePercentage}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Remaining</span>
                  <div className="text-xl font-bold font-mono text-blue-600">
                    {oilSummary.remainingKM?.toLocaleString()} KM
                  </div>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    oilSummary.usagePercentage >= 90
                      ? 'bg-red-500'
                      : oilSummary.usagePercentage >= 75
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${oilSummary.usagePercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Change Odometer</span>
                <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">
                  {oilSummary.lastServiceOdometer?.toLocaleString()} KM
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Driven Since</span>
                <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">
                  {oilSummary.distanceSince?.toLocaleString()} KM
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Next Target</span>
                <div className="text-sm font-bold font-mono text-blue-700 mt-0.5">
                  {oilSummary.nextDueOdometer?.toLocaleString()} KM
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Paid</span>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  ৳{oilSummary.totalCost?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 8: AUTOMATIC DUAL PREDICTION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Automatic Date Prediction</h3>
                  <span className="text-[10px] text-slate-400">Distance vs Time limit</span>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50/60 to-blue-50/60 border border-indigo-100 rounded-xl">
                  <span className="text-[11px] text-indigo-900 font-semibold">
                    Estimated Next Oil Change:
                  </span>
                  <div className="text-xl font-extrabold text-indigo-950 mt-1">
                    {oilSummary.prediction?.label || 'Calculating...'}
                  </div>
                  <div className="text-[11px] text-indigo-700 mt-1">
                    Limited by:{' '}
                    <strong>
                      {oilSummary.prediction?.limitedBy === 'distance'
                        ? 'Distance limit (Daily KM rate)'
                        : oilSummary.prediction?.limitedBy === 'calendar'
                        ? 'Calendar time limit'
                        : 'Pending data'}
                    </strong>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Calculated Daily Rate:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {oilSummary.averageDailyKM > 0
                        ? `${oilSummary.averageDailyKM} KM/day (${oilSummary.confidence} confidence)`
                        : 'Insufficient log history'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Calendar Deadline:</span>
                    <span className="text-slate-800">
                      {oilSummary.nextDueDate
                        ? new Date(oilSummary.nextDueDate).toLocaleDateString('en-GB')
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              <strong>Note:</strong> All predicted dates are algorithmic estimates. Prioritize the manufacturer owner&apos;s manual specifications and engine sound.
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
          No engine oil change records logged yet for this vehicle.
        </div>
      )}

      {/* Historical Oil Changes Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">Oil Change History</h3>
        <p className="text-xs text-slate-500 mb-4">
          Complete audit trail of all previous engine oil changes and drain intervals
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Oil Brand & Viscosity</th>
                <th className="pb-3">Odometer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Total Cost</th>
                <th className="pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No historical logs.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-900">{h.brand}</td>
                    <td className="py-3 font-mono font-medium text-slate-800">
                      {h.odometer?.toLocaleString()} KM
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(h.serviceDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 font-semibold text-slate-900">
                      ৳{h.totalCost?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 text-slate-500 max-w-xs truncate">
                      {h.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: LOG ENGINE OIL CHANGE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Droplets className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Log Engine Oil Change</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Popular Presets Quick-Click */}
            {compatibleOils.length > 0 && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 mb-1.5 block">
                  Select Popular Preset for {activeVehicle?.type}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {compatibleOils.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="px-2 py-1 rounded bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-medium text-slate-700"
                    >
                      {p.brand} {p.productName} ({p.viscosity})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveOilChange} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Oil Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={oilBrand}
                    onChange={(e) => setOilBrand(e.target.value)}
                    placeholder="e.g. Motul, Yamalube, Shell"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={oilProductName}
                    onChange={(e) => setOilProductName(e.target.value)}
                    placeholder="e.g. 7100 4T, Helix Ultra"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Viscosity Grade *
                  </label>
                  <input
                    type="text"
                    required
                    value={viscosity}
                    onChange={(e) => setViscosity(e.target.value)}
                    placeholder="e.g. 10W-40, 5W-30"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Oil Composition *
                  </label>
                  <select
                    value={oilType}
                    onChange={(e) => setOilType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Fully Synthetic">Fully Synthetic</option>
                    <option value="Semi-Synthetic">Semi-Synthetic</option>
                    <option value="Mineral">Mineral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Oil Quantity (Liters) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={oilQuantity}
                    onChange={(e) => setOilQuantity(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Odometer at Change (KM) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={odometerAtChange}
                    onChange={(e) => setOdometerAtChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recommended Change Interval (KM) *
                  </label>
                  <input
                    type="number"
                    min="500"
                    required
                    value={recommendedIntervalKM}
                    onChange={(e) => setRecommendedIntervalKM(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recommended Interval (Months) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={recommendedIntervalMonths}
                    onChange={(e) => setRecommendedIntervalMonths(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Oil Bottle Price (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={oilPrice}
                    onChange={(e) => setOilPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Charge / Filter (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Change Date *
                </label>
                <input
                  type="date"
                  required
                  value={oilChangeDate}
                  onChange={(e) => setOilChangeDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Changed along with OEM oil filter"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold shadow disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Oil Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
