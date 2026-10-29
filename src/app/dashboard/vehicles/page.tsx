'use client';

import React from 'react';
import Link from 'next/link';
import { useVehicle } from '@/context/VehicleContext';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Car,
  Bike,
  PlusCircle,
  Gauge,
  Calendar,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function VehiclesListPage() {
  const { vehicles, activeVehicle, selectVehicle, refreshVehicles } = useVehicle();
  const { user, token } = useAuth();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from your garage?`)) return;

    try {
      await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
      });
      await refreshVehicles();
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Garage</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your registered motorcycles and cars, track odometers, and switch active vehicle.
          </p>
        </div>
        <Link
          href="/dashboard/vehicles/add"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Register New Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Car className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No vehicles registered</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Add your primary commuter bike or car to unlock automated maintenance tracking.
          </p>
          <Link
            href="/dashboard/vehicles/add"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-4 py-2 text-xs font-semibold"
          >
            Add Vehicle Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => {
            const isActive = v._id === activeVehicle?._id;

            return (
              <div
                key={v._id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-blue-600 ring-2 ring-blue-100 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {v.image ? (
                          <img src={v.image} alt={v.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-slate-600">
                            {v.type === 'motorcycle' ? (
                              <Bike className="h-6 w-6" />
                            ) : (
                              <Car className="h-6 w-6" />
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {v.name}
                        </h3>
                        <div className="text-[11px] font-mono font-medium text-slate-500 mt-0.5">
                          {v.registrationNumber}
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Manufacturer & Model:</span>
                      <span className="font-semibold text-slate-800">
                        {v.manufacturer} {v.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Odometer:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {v.currentOdometer?.toLocaleString()} KM
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Year & Engine:</span>
                      <span className="text-slate-800">
                        {v.year} &bull; {v.engineCC ? `${v.engineCC} CC` : '—'} &bull; {v.fuelType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <button
                        onClick={() => selectVehicle(v._id!)}
                        className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        Set as Active
                      </button>
                    )}
                    <Link
                      href={`/dashboard/vehicles/${v._id}`}
                      className="rounded-lg text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      Details <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <button
                    onClick={() => handleDelete(v._id!, v.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete vehicle"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
