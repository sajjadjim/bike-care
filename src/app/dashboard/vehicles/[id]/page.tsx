'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import {
  Car,
  Bike,
  Gauge,
  Calendar,
  Wrench,
  Droplets,
  FileCheck2,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Edit3,
} from 'lucide-react';

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const router = useRouter();
  const { user, token } = useAuth();
  const { refreshVehicles, selectVehicle } = useVehicle();

  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchVehicle = useCallback(async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setVehicle(data.vehicle);
      }
    } catch (err) {
      console.error('Failed to load vehicle details:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, token, user]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12 text-sm text-slate-500">
        Vehicle not found.{' '}
        <Link href="/dashboard/vehicles" className="text-blue-600 underline font-semibold">
          Return to My Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/vehicles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Vehicles
        </Link>
        <button
          onClick={() => {
            selectVehicle(vehicle._id);
            router.push('/dashboard');
          }}
          className="rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 text-xs font-bold hover:bg-blue-100"
        >
          Set as Active Vehicle
        </button>
      </div>

      {/* Vehicle Hero Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            {vehicle.image ? (
              <img src={vehicle.image} alt={vehicle.name} className="h-full w-full object-cover" />
            ) : (
              <div className="text-slate-500">
                {vehicle.type === 'motorcycle' ? (
                  <Bike className="h-10 w-10" />
                ) : (
                  <Car className="h-10 w-10" />
                )}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{vehicle.name}</h1>
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {vehicle.registrationNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {vehicle.manufacturer} {vehicle.model} &bull; {vehicle.year} &bull;{' '}
              {vehicle.engineCC ? `${vehicle.engineCC} CC` : ''} &bull; {vehicle.fuelType}
            </p>
            <div className="mt-2 text-xs font-bold text-blue-600 font-mono">
              Odometer: {vehicle.currentOdometer.toLocaleString()} KM
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link
            href={`/dashboard/vehicles/${vehicle._id}/maintenance/add`}
            className="flex-1 md:flex-initial text-center rounded-xl bg-blue-600 text-white px-4 py-2.5 text-xs font-bold shadow hover:bg-blue-700"
          >
            Add Maintenance
          </Link>
        </div>
      </div>

      {/* Quick Navigation to modules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href={`/dashboard/vehicles/${vehicle._id}/engine-oil`}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all text-center group"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <Droplets className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 block">Engine Oil</span>
          <span className="text-[10px] text-slate-400">Degradation & predictions</span>
        </Link>

        <Link
          href={`/dashboard/vehicles/${vehicle._id}/maintenance`}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all text-center group"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <Wrench className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 block">Maintenance</span>
          <span className="text-[10px] text-slate-400">Parts states & history</span>
        </Link>

        <Link
          href={`/dashboard/vehicles/${vehicle._id}/documents`}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all text-center group"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 block">BRTA Documents</span>
          <span className="text-[10px] text-slate-400">Tax token & fitness</span>
        </Link>

        <Link
          href={`/dashboard/vehicles/${vehicle._id}/expenses`}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all text-center group"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 block">Expenses (৳)</span>
          <span className="text-[10px] text-slate-400">Cost per KM analytics</span>
        </Link>
      </div>

      {/* Specifications Details */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Detailed Specifications</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-semibold block">Manufacturer</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.manufacturer}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-semibold block">Model</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.model}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-semibold block">Registration Number</span>
            <span className="font-bold font-mono text-slate-900 text-sm mt-0.5 block">{vehicle.registrationNumber}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-semibold block">Manufacturing Year</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.year}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-semibold block">Engine Capacity</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.engineCC ? `${vehicle.engineCC} CC` : '—'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-semibold block">Fuel Type</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.fuelType}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-semibold block">Color</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.color || 'Standard'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-semibold block">Purchase Date</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toLocaleDateString('en-GB') : '—'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-semibold block">Registration Year</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{vehicle.registrationYear || vehicle.year}</span>
          </div>
        </div>

        {vehicle.notes && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
            <strong>Notes:</strong> {vehicle.notes}
          </div>
        )}
      </div>
    </div>
  );
}
