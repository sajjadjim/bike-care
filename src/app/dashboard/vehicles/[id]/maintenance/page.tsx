'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import {
  Wrench,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  Filter,
  History,
  Layers,
} from 'lucide-react';

export default function MaintenanceOverviewPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { user, token } = useAuth();
  const { activeVehicle } = useVehicle();

  const [states, setStates] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'states' | 'history'>('states');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const fetchData = useCallback(async () => {
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
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, token, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Categories present in states
  const categories = ['ALL', ...Array.from(new Set(states.map((s) => s.category)))];

  const filteredStates = states.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && s.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Maintenance Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status tracking for each component, remaining distance, and lifecycle schedule.
          </p>
        </div>
        <Link
          href={`/dashboard/vehicles/${vehicleId}/maintenance/add`}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Log Maintenance Record
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('states')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'states'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="h-4 w-4" />
          Active Component States ({states.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'history'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="h-4 w-4" />
          Full Audit History ({history.length})
        </button>
      </div>

      {tab === 'states' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold text-[11px] uppercase mr-1">
                Status:
              </span>
              {['ALL', 'RED', 'YELLOW', 'GREEN'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    statusFilter === st
                      ? st === 'RED'
                        ? 'bg-red-600 text-white'
                        : st === 'YELLOW'
                        ? 'bg-amber-500 text-white'
                        : st === 'GREEN'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL'
                    ? 'All'
                    : st === 'RED'
                    ? 'Overdue'
                    : st === 'YELLOW'
                    ? 'Approaching'
                    : 'Good'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold text-[11px] uppercase">
                Category:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-300 py-1 px-2.5 text-xs text-slate-800 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Component States Cards Grid */}
          {filteredStates.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
              No component states match the selected filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStates.map((state) => {
                const isOverdue = state.status === 'RED';
                const isApproaching = state.status === 'YELLOW';

                return (
                  <div
                    key={state._id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm flex flex-col justify-between transition-all ${
                      isOverdue
                        ? 'border-red-300 ring-1 ring-red-200'
                        : isApproaching
                        ? 'border-amber-300 ring-1 ring-amber-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {state.category}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {state.partName}
                          </h3>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isOverdue
                              ? 'bg-red-100 text-red-700'
                              : isApproaching
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isOverdue ? 'OVERDUE' : isApproaching ? 'DUE SOON' : 'GOOD'}
                        </span>
                      </div>

                      <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs mb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Last Action:</span>
                          <span className="font-bold text-slate-800">{state.lastAction}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Last Service Odometer:</span>
                          <span className="font-mono text-slate-800">
                            {state.lastServiceOdometer?.toLocaleString()} KM
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Last Service Date:</span>
                          <span className="text-slate-800">
                            {new Date(state.lastServiceDate).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        {state.brand && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Brand / Spec:</span>
                            <span className="text-slate-800 truncate max-w-[140px]">
                              {state.brand}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <div
                          className={`font-mono font-bold ${
                            isOverdue
                              ? 'text-red-600'
                              : isApproaching
                              ? 'text-amber-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {state.remainingKM !== null && state.remainingKM !== undefined
                            ? state.remainingKM <= 0
                              ? `Overdue (${Math.abs(state.remainingKM)} KM)`
                              : `${state.remainingKM.toLocaleString()} KM Left`
                            : 'Interval not set'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {state.nextDueOdometer
                            ? `Due at ${state.nextDueOdometer.toLocaleString()} KM`
                            : ''}
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/vehicles/${vehicleId}/maintenance/add`}
                        className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 font-semibold text-[11px]"
                      >
                        Update
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Full Audit History Tab */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Part Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Odometer</th>
                <th className="pb-3">Service Date</th>
                <th className="pb-3">Brand / Details</th>
                <th className="pb-3 text-right">Cost (BDT ৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No historical logs recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-900">{item.partName}</td>
                    <td className="py-3 text-slate-500">{item.category}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.action}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-medium text-slate-800">
                      {item.odometer?.toLocaleString()} KM
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(item.serviceDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 text-slate-500 max-w-xs truncate">
                      {item.brand || item.notes || '—'}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">
                      ৳{item.totalCost?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
