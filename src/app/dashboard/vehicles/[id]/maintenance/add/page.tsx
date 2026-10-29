'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import { MaintenanceAction } from '@/types';
import { DEFAULT_PART_CATALOG } from '@/constants/catalog';
import {
  Wrench,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export default function AddMaintenancePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleIdParam = params?.id as string;

  const { user, token } = useAuth();
  const { vehicles, activeVehicle, refreshVehicles } = useVehicle();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    vehicleIdParam || activeVehicle?._id || ''
  );

  const vehicle = vehicles.find((v) => v._id === selectedVehicleId) || activeVehicle;

  // Form states
  const [category, setCategory] = useState<string>('Engine');
  const [partId, setPartId] = useState<string>('');
  const [partName, setPartName] = useState<string>('');
  const [action, setAction] = useState<MaintenanceAction>('REPLACED');
  const [serviceDate, setServiceDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [odometer, setOdometer] = useState<number | string>(
    vehicle?.currentOdometer || ''
  );
  const [brand, setBrand] = useState<string>('');
  const [partsCost, setPartsCost] = useState<number | string>('');
  const [laborCost, setLaborCost] = useState<number | string>('');
  const [intervalKM, setIntervalKM] = useState<number | string>('');
  const [intervalMonths, setIntervalMonths] = useState<number | string>('');
  const [notes, setNotes] = useState<string>('');

  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vehicle) {
      // Filter catalog for vehicle type
      const filtered = DEFAULT_PART_CATALOG.filter(
        (p) => p.vehicleType === vehicle.type || p.vehicleType === 'all'
      );
      setCatalog(filtered);
    }
  }, [vehicle]);

  const categories = Array.from(new Set(catalog.map((p) => p.category)));
  const partsInCategory = catalog.filter((p) => p.category === category);

  const handleSelectPart = (p: any) => {
    setPartId(p.partId);
    setPartName(p.name);
    if (p.defaultActions && p.defaultActions.length > 0) {
      setAction(p.defaultActions[0]);
    }
    if (p.suggestedReplacementIntervalKM) {
      setIntervalKM(p.suggestedReplacementIntervalKM);
    }
    if (p.suggestedReplacementMonths) {
      setIntervalMonths(p.suggestedReplacementMonths);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedVehicleId) {
      setError('Please select a vehicle.');
      return;
    }
    if (!partName.trim()) {
      setError('Please select or specify a part.');
      return;
    }
    if (!odometer && odometer !== 0) {
      setError('Odometer reading is required.');
      return;
    }

    setLoading(true);
    try {
      const pCost = Number(partsCost) || 0;
      const lCost = Number(laborCost) || 0;
      const totalCost = pCost + lCost;

      const payload = {
        vehicleId: selectedVehicleId,
        partId: partId || `custom-${Date.now()}`,
        partName,
        category,
        maintenanceTaskId: action,
        action,
        serviceDate,
        odometer: Number(odometer),
        brand: brand || undefined,
        partsCost: pCost,
        laborCost: lCost,
        totalCost,
        notes: notes || undefined,
        intervalKM: intervalKM ? Number(intervalKM) : undefined,
        intervalMonths: intervalMonths ? Number(intervalMonths) : undefined,
      };

      const res = await fetch('/api/maintenance', {
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
        throw new Error(data.error || 'Failed to save maintenance record');
      }

      await refreshVehicles();
      router.push(`/dashboard/vehicles/${selectedVehicleId}/maintenance`);
    } catch (err: any) {
      setError(err.message || 'Failed to record maintenance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Record Maintenance Activity
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Smart maintenance records automatically update the component&apos;s active status, calculate remaining kilometers, and project next service dates.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: SELECT VEHICLE */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Step 1: Vehicle Selection
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Vehicle
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name} ({v.registrationNumber}) — {v.currentOdometer.toLocaleString()} KM
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STEP 2 & 3: PARTS CATEGORY & PART SELECTION */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Step 2 & 3: Component & Part
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setPartId('');
                    setPartName('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Choose Pre-Configured Part in {category}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-xl">
              {partsInCategory.map((p) => (
                <button
                  key={p.partId}
                  type="button"
                  onClick={() => handleSelectPart(p)}
                  className={`p-2.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between ${
                    partId === p.partId
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{p.name}</span>
                  {partId === p.partId && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Part Name (Or enter custom part)
            </label>
            <input
              type="text"
              required
              value={partName}
              onChange={(e) => {
                setPartName(e.target.value);
                setPartId('');
              }}
              placeholder="e.g. Front Brake Pad"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* STEP 4: ACTION */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Step 4: Maintenance Action Performed
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(
              ['REPLACED', 'REPAIRED', 'CLEANED', 'INSPECTED', 'ADJUSTED', 'LUBRICATED'] as MaintenanceAction[]
            ).map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setAction(act)}
                className={`py-2 px-2 rounded-xl text-center text-xs font-bold uppercase transition-all ${
                  action === act
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 5 & 6: DATE & ODOMETER */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Step 5 & 6: Service Date & Odometer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Date *
              </label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Odometer at Service (KM) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  placeholder="e.g. 11500"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  KM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 7 & 8: COST & BRAND */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Step 7 & 8: Financials & Parts Brand
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parts Cost (BDT ৳)
              </label>
              <input
                type="number"
                min="0"
                value={partsCost}
                onChange={(e) => setPartsCost(e.target.value)}
                placeholder="৳0"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Labor / Service Charge (৳)
              </label>
              <input
                type="number"
                min="0"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                placeholder="৳0"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand / Model Used
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Bosch / OEM"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* STEP 9 & 10: INTERVALS & NOTES */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Step 9: Next Service Schedule & Notes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Next Service Interval (KM)
              </label>
              <input
                type="number"
                min="100"
                value={intervalKM}
                onChange={(e) => setIntervalKM(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Next Service Interval (Months)
              </label>
              <input
                type="number"
                min="1"
                value={intervalMonths}
                onChange={(e) => setIntervalMonths(e.target.value)}
                placeholder="e.g. 3"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes & Garage Details
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Cleaned with compressed air during 10k scheduled service at Yamaha Care Tejgaon."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* STEP 10: SAVE BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Saving Record...' : 'Save & Update State'}
          </button>
        </div>
      </form>
    </div>
  );
}
