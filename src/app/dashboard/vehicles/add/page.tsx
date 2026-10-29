'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import {
  VEHICLE_MANUFACTURERS,
  getModelsForManufacturer,
} from '@/constants/catalog';
import { VehicleType, FuelType } from '@/types';
import {
  Bike,
  Car,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Gauge,
  Sparkles,
} from 'lucide-react';

export default function AddVehicleWizardPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { refreshVehicles, selectVehicle } = useVehicle();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [type, setType] = useState<VehicleType>('motorcycle');
  const [manufacturer, setManufacturer] = useState('');
  const [customManufacturer, setCustomManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [customModel, setCustomModel] = useState('');

  // Details
  const [name, setName] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [registrationYear, setRegistrationYear] = useState<number>(new Date().getFullYear());
  const [engineCC, setEngineCC] = useState<number | string>(150);
  const [fuelType, setFuelType] = useState<FuelType>('Octane');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState<number | string>(0);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [color, setColor] = useState('');
  const [image, setImage] = useState('');
  const [notes, setNotes] = useState('');

  // Documents
  const [taxTokenExpiry, setTaxTokenExpiry] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [fitnessExpiry, setFitnessExpiry] = useState('');

  const activeManufacturer = manufacturer === 'Other' ? customManufacturer : manufacturer;
  const activeModel = model === 'Other' ? customModel : model;

  const availableModels = manufacturer
    ? getModelsForManufacturer(type, manufacturer)
    : [];

  const handleNextFromStep1 = () => {
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!manufacturer) {
      setError('Please select a manufacturer');
      return;
    }
    if (manufacturer === 'Other' && !customManufacturer.trim()) {
      setError('Please enter custom manufacturer name');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleNextFromStep3 = () => {
    if (!model) {
      setError('Please select or specify a model');
      return;
    }
    if (model === 'Other' && !customModel.trim()) {
      setError('Please enter custom model name');
      return;
    }
    setError(null);
    if (!name) {
      setName(`${activeManufacturer} ${activeModel}`);
    }
    setStep(4);
  };

  const handleNextFromStep4 = () => {
    if (!name.trim()) {
      setError('Vehicle name or nickname is required');
      return;
    }
    if (!registrationNumber.trim()) {
      setError('Registration number is required (e.g. Dhaka Metro LA-11-2233)');
      return;
    }
    setError(null);
    setStep(5);
  };

  const handleFinish = async () => {
    setError(null);
    setLoading(true);

    try {
      // 1. Create Vehicle
      const vehiclePayload = {
        name,
        type,
        manufacturer: activeManufacturer,
        model: activeModel,
        year: Number(year),
        registrationYear: Number(registrationYear),
        engineCC: Number(engineCC) || undefined,
        fuelType,
        registrationNumber,
        currentOdometer: Number(currentOdometer) || 0,
        purchaseDate: purchaseDate || undefined,
        color: color || undefined,
        image: image || undefined,
        notes: notes || undefined,
      };

      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
        body: JSON.stringify(vehiclePayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create vehicle');
      }

      const newVehicle = data.vehicle;
      const vehicleId = newVehicle._id;

      // 2. Save Documents if specified
      if (taxTokenExpiry) {
        await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
            'x-demo-user-id': user?.uid || '',
          },
          body: JSON.stringify({
            vehicleId,
            documentType: 'TAX_TOKEN',
            expiryDate: taxTokenExpiry,
            notes: 'Added during onboarding',
          }),
        });
      }

      if (insuranceExpiry) {
        await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
            'x-demo-user-id': user?.uid || '',
          },
          body: JSON.stringify({
            vehicleId,
            documentType: 'INSURANCE',
            expiryDate: insuranceExpiry,
            notes: 'Added during onboarding',
          }),
        });
      }

      if (fitnessExpiry && type === 'car') {
        await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
            'x-demo-user-id': user?.uid || '',
          },
          body: JSON.stringify({
            vehicleId,
            documentType: 'FITNESS',
            expiryDate: fitnessExpiry,
            notes: 'Added during onboarding',
          }),
        });
      }

      await refreshVehicles();
      selectVehicle(vehicleId);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register vehicle');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Wizard Progress Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Vehicle Registration Wizard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete the steps to configure your smart maintenance schedule and notifications.
        </p>

        <div className="mt-6 flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 -z-10" />
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
                s === step
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : s < step
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-400 border border-slate-300'
              }`}
            >
              {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2 px-1">
          <span>Type</span>
          <span>Brand</span>
          <span>Model</span>
          <span>Details</span>
          <span>Documents</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: VEHICLE TYPE */}
      {step === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Step 1: Select Vehicle Type</h2>
          <p className="text-xs text-slate-500 mb-6">
            Choose whether you are adding a motorcycle or a car to tailor the maintenance catalogs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('motorcycle')}
              className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                type === 'motorcycle'
                  ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${
                  type === 'motorcycle'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Bike className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Motorcycle / Scooter</h3>
              <p className="text-xs text-slate-500 mt-1">
                Optimized for drive chain cleaning, fork oil, spark plugs, and 4T engine oil.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setType('car')}
              className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                type === 'car'
                  ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${
                  type === 'car' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Car className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Passenger Car / SUV</h3>
              <p className="text-xs text-slate-500 mt-1">
                Optimized for cabin AC filters, ATF fluids, tyre rotations, and coolant.
              </p>
            </button>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow"
            >
              Next: Select Brand
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MANUFACTURER */}
      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Step 2: Select Manufacturer ({type === 'motorcycle' ? 'Motorcycle' : 'Car'})
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Choose from popular brands in Bangladesh or enter a custom manufacturer.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {VEHICLE_MANUFACTURERS[type].map((mfg) => (
              <button
                key={mfg}
                type="button"
                onClick={() => {
                  setManufacturer(mfg);
                  setModel('');
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  manufacturer === mfg
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                {mfg}
              </button>
            ))}
          </div>

          {manufacturer === 'Other' && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Custom Manufacturer Name
              </label>
              <input
                type="text"
                required
                value={customManufacturer}
                onChange={(e) => setCustomManufacturer(e.target.value)}
                placeholder="e.g. Benelli, GPX, Haval"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={handleNextFromStep2}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow"
            >
              Next: Select Model
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MODEL */}
      {step === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Step 3: Select Model for {activeManufacturer}
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Models dynamically tailored to your selected brand.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableModels.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModel(m)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  model === m
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {(model === 'Other' || availableModels.length === 0) && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Custom Model Name
              </label>
              <input
                type="text"
                required
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. X-Blade 160 ABS"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={handleNextFromStep3}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow"
            >
              Next: Vehicle Details
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: VEHICLE DETAILS */}
      {step === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Step 4: Vehicle Details</h2>
          <p className="text-xs text-slate-500 mb-6">
            Provide odometer reading, registration, engine capacity, and specs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Name / Nickname *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Phantom R15 V4"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Odometer Reading (KM) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={currentOdometer}
                  onChange={(e) => setCurrentOdometer(e.target.value)}
                  placeholder="e.g. 11500"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  KM
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. Dhaka Metro LA-55-9012"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Engine Capacity (CC)
              </label>
              <input
                type="number"
                value={engineCC}
                onChange={(e) => setEngineCC(e.target.value)}
                placeholder="e.g. 155"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fuel Type
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="Octane">Octane</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="LPG">LPG</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manufacturing Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Racing Blue"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Photo URL (Optional)
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={handleNextFromStep4}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow"
            >
              Next: Documents (Optional)
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: DOCUMENTS & FINISH */}
      {step === 5 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Step 5: BRTA Documents Tracking (Optional)
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter expiry dates now to automatically receive countdown alerts, or add them later.
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-900 mb-1">
                BRTA Tax Token Expiration Date
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                MotoCare will warn you with amber & red countdown badges before renewal fees accrue.
              </p>
              <input
                type="date"
                value={taxTokenExpiry}
                onChange={(e) => setTaxTokenExpiry(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Insurance Expiration Date
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                1st party or 3rd party motor vehicle insurance policy expiry date.
              </p>
              <input
                type="date"
                value={insuranceExpiry}
                onChange={(e) => setInsuranceExpiry(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
              />
            </div>

            {type === 'car' && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  BRTA Fitness Certificate Expiration
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Applicable for cars and commercial vehicles.
                </p>
                <input
                  type="date"
                  value={fitnessExpiry}
                  onChange={(e) => setFitnessExpiry(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
                />
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-8 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving Vehicle...' : 'Save & Launch Dashboard'}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
