'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import {
  Wrench,
  Droplets,
  Gauge,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Car,
  Bike,
  Sparkles,
  Calendar,
  AlertOctagon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function DashboardOverviewPage() {
  const { user, token } = useAuth();
  const { activeVehicle, loading: vehicleLoading } = useVehicle();

  const [loading, setLoading] = useState(true);
  const [maintenanceStates, setMaintenanceStates] = useState<any[]>([]);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [oilSummary, setOilSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState<any>(null);
  const [averageDailyKM, setAverageDailyKM] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    if (!activeVehicle || !user || (!token && !user.isDemo)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const authHeader = `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`;
      const demoHeader = user?.uid || '';

      const [maintRes, oilRes, docRes, expRes] = await Promise.all([
        fetch(`/api/maintenance?vehicleId=${activeVehicle._id}`, {
          headers: { Authorization: authHeader, 'x-demo-user-id': demoHeader },
        }),
        fetch(`/api/engine-oil?vehicleId=${activeVehicle._id}`, {
          headers: { Authorization: authHeader, 'x-demo-user-id': demoHeader },
        }),
        fetch(`/api/documents?vehicleId=${activeVehicle._id}`, {
          headers: { Authorization: authHeader, 'x-demo-user-id': demoHeader },
        }),
        fetch(`/api/expenses?vehicleId=${activeVehicle._id}`, {
          headers: { Authorization: authHeader, 'x-demo-user-id': demoHeader },
        }),
      ]);

      if (maintRes.ok) {
        const mData = await maintRes.json();
        setMaintenanceStates(mData.states || []);
        setHistoryRecords(mData.history || []);
        setAverageDailyKM(mData.averageDailyKM || 0);
      }

      if (oilRes.ok) {
        const oData = await oilRes.json();
        setOilSummary(oData.oilState || null);
      }

      if (docRes.ok) {
        const dData = await docRes.json();
        setDocuments(dData.documents || []);
      }

      if (expRes.ok) {
        const eData = await expRes.json();
        setExpenses(eData);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeVehicle, token, user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (vehicleLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!activeVehicle) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-xl mx-auto my-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
          <Car className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Vehicle Registered Yet</h2>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Welcome to MotoCare! Register your motorcycle or car to start monitoring engine oil, odometer readings, parts lifecycle, and BRTA tax tokens.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/vehicles/add"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Add Vehicle via Wizard
          </Link>
          <button
            onClick={async () => {
              await fetch('/api/seed', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
                  'x-demo-user-id': user?.uid || '',
                },
              });
              window.location.reload();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            Load Sample Yamaha R15
          </button>
        </div>
      </div>
    );
  }

  // Calculate high-level summary counts
  const overdueCount = maintenanceStates.filter((s) => s.status === 'RED').length;
  const approachingCount = maintenanceStates.filter((s) => s.status === 'YELLOW').length;
  const totalRecords = historyRecords.length || maintenanceStates.length;

  // Tax token document
  const taxTokenDoc = documents.find((d) => d.documentType === 'TAX_TOKEN');

  // Vehicle age calculation
  const currentYear = new Date().getFullYear();
  const vehicleAge = activeVehicle.year ? `${currentYear - activeVehicle.year} yrs` : 'Brand New';

  // Last maintenance date
  const lastServiceDate = historyRecords[0]?.serviceDate
    ? new Date(historyRecords[0].serviceDate).toLocaleDateString('en-GB')
    : maintenanceStates[0]?.lastServiceDate
    ? new Date(maintenanceStates[0].lastServiceDate).toLocaleDateString('en-GB')
    : 'No records yet';

  return (
    <div className="space-y-6">
      {/* SECTION A: VEHICLE OVERVIEW BANNER */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
              {activeVehicle.image ? (
                <img
                  src={activeVehicle.image}
                  alt={activeVehicle.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-blue-400">
                  {activeVehicle.type === 'motorcycle' ? (
                    <Bike className="h-9 w-9" />
                  ) : (
                    <Car className="h-9 w-9" />
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {activeVehicle.name}
                </h1>
                <span className="text-xs font-mono bg-blue-900/80 text-blue-200 border border-blue-700 px-2 py-0.5 rounded font-bold">
                  {activeVehicle.registrationNumber}
                </span>
                <span className="capitalize text-[11px] bg-white/10 text-slate-300 px-2 py-0.5 rounded">
                  {activeVehicle.type}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {activeVehicle.manufacturer} {activeVehicle.model} &bull; {activeVehicle.year} &bull;{' '}
                {activeVehicle.engineCC ? `${activeVehicle.engineCC} CC` : ''} &bull; {activeVehicle.fuelType}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
                <span>Current: <strong className="text-white">{activeVehicle.currentOdometer.toLocaleString()} KM</strong></span>
                <span>Age: <strong className="text-slate-200">{vehicleAge}</strong></span>
                <span>Last Service: <strong className="text-slate-200">{lastServiceDate}</strong></span>
                {averageDailyKM > 0 && (
                  <span>Avg Rate: <strong className="text-blue-300">~{averageDailyKM} KM/day</strong></span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
            <Link
              href={`/dashboard/vehicles/${activeVehicle._id}/maintenance/add`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md"
            >
              <PlusCircle className="h-4 w-4" />
              Add Maintenance
            </Link>
            <Link
              href={`/dashboard/vehicles/${activeVehicle._id}/engine-oil`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 text-xs font-semibold transition-colors"
            >
              <Droplets className="h-4 w-4 text-blue-400" />
              Engine Oil Tracker
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION B: 6 MAINTENANCE SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Records */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold">Total Records</span>
            <Wrench className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalRecords}</div>
          <div className="text-[11px] text-slate-400 mt-1">Logged maintenance</div>
        </div>

        {/* Card 2: Upcoming Services */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 text-xs mb-1.5">
            <span className="font-semibold">Upcoming</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{approachingCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Due within 300 KM</div>
        </div>

        {/* Card 3: Overdue */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-red-600 text-xs mb-1.5">
            <span className="font-semibold">Overdue</span>
            <AlertOctagon className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600">{overdueCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Immediate attention</div>
        </div>

        {/* Card 4: Engine Oil Remaining KM */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 text-xs mb-1.5">
            <span className="font-semibold">Engine Oil</span>
            <Droplets className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {oilSummary ? `${oilSummary.remainingKM?.toLocaleString()} KM` : 'Not Logged'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {oilSummary?.prediction?.label || 'Run initial change'}
          </div>
        </div>

        {/* Card 5: Tax Token Validity */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 text-xs mb-1.5">
            <span className="font-semibold">Tax Token</span>
            <FileCheck2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className={`text-xl sm:text-2xl font-black truncate ${
            taxTokenDoc?.remainingDays <= 0 ? 'text-red-600' : taxTokenDoc?.remainingDays <= 30 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {taxTokenDoc ? `${taxTokenDoc.remainingDays} Days` : 'Not Set'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">BRTA Road Validity</div>
        </div>

        {/* Card 6: Monthly Expense */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold">Total Expenses</span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            ৳{expenses?.totalExpense?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            ৳{expenses?.costPerKM || 0}/KM driven
          </div>
        </div>
      </div>

      {/* SECTION C & D: UPCOMING MAINTENANCE MATRIX & RECENT ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Services List (2 cols on lg) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Upcoming Maintenance Tasks</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically scheduled by remaining kilometers and calendar deadlines
              </p>
            </div>
            <Link
              href={`/dashboard/vehicles/${activeVehicle._id}/maintenance`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {maintenanceStates.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active maintenance states tracked yet. Click &quot;Add Maintenance&quot; to log your first service.
              </div>
            ) : (
              maintenanceStates.slice(0, 5).map((state) => {
                const isOverdue = state.status === 'RED';
                const isApproaching = state.status === 'YELLOW';

                return (
                  <div
                    key={state._id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 -mx-2 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isOverdue
                            ? 'bg-red-100 text-red-600'
                            : isApproaching
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {state.partName}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                            {state.lastAction}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Category: {state.category} &bull; Brand: {state.brand || 'Standard'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                      <div>
                        <div
                          className={`text-xs font-bold font-mono ${
                            isOverdue
                              ? 'text-red-600'
                              : isApproaching
                              ? 'text-amber-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {state.remainingKM !== null && state.remainingKM !== undefined
                            ? state.remainingKM <= 0
                              ? 'Overdue by ' + Math.abs(state.remainingKM) + ' KM'
                              : `${state.remainingKM.toLocaleString()} KM Remaining`
                            : 'Interval not configured'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {state.remainingDays !== null && state.remainingDays !== undefined
                            ? state.remainingDays <= 0
                              ? 'Overdue'
                              : `Due in ~${state.remainingDays} days`
                            : 'Distance based'}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isOverdue
                            ? 'bg-red-100 text-red-700'
                            : isApproaching
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {state.status === 'RED'
                          ? 'OVERDUE'
                          : state.status === 'YELLOW'
                          ? 'DUE SOON'
                          : 'GOOD'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Engine Oil Status Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Droplets className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Engine Oil Monitor</h3>
              </div>
              <Link
                href={`/dashboard/vehicles/${activeVehicle._id}/engine-oil`}
                className="text-xs font-semibold text-blue-600 hover:text-blue-500"
              >
                Manage
              </Link>
            </div>

            {oilSummary ? (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Usage Progress</span>
                    <span className="font-bold text-slate-900">
                      {oilSummary.usagePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
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

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Oil Product:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[150px]">
                      {oilSummary.brand}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Changed At:</span>
                    <span className="font-mono text-slate-800">
                      {oilSummary.lastServiceOdometer?.toLocaleString()} KM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distance Since Change:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {oilSummary.distanceSince?.toLocaleString()} KM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining Kilometers:</span>
                    <span className="font-mono font-bold text-blue-600">
                      {oilSummary.remainingKM?.toLocaleString()} KM
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
                  <div className="font-semibold flex items-center gap-1.5 mb-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    Automatic Oil Prediction
                  </div>
                  <p className="text-[11px] text-blue-800">
                    {oilSummary.prediction?.label || 'Calculating based on daily odometer averages...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                No engine oil change logged yet.
                <div className="mt-3">
                  <Link
                    href={`/dashboard/vehicles/${activeVehicle._id}/engine-oil`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white text-xs px-3 py-1.5 font-semibold"
                  >
                    Log Oil Change
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Complies with owner manual service specifications
          </div>
        </div>
      </div>

      {/* SECTION F: EXPENSE ANALYTICS & RECHARTS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Maintenance Expense Analytics</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical cost breakdown and category spending in Bangladeshi Taka (৳)
            </p>
          </div>
          <Link
            href={`/dashboard/vehicles/${activeVehicle._id}/expenses`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1"
          >
            Full Analytics <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Bar Chart (Monthly) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Monthly Maintenance Expenses (৳)
            </h3>
            {expenses?.monthlyExpenses && expenses.monthlyExpenses.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenses.monthlyExpenses}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `৳${val}`} />
                    <Tooltip
                      formatter={(val: any) => [`৳${val.toLocaleString()}`, 'Spent']}
                      contentStyle={{ borderRadius: '0.75rem', fontSize: '12px' }}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                Expense history will appear as maintenance records are logged.
              </div>
            )}
          </div>

          {/* Category Split */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Cost by Category
            </h3>
            {expenses?.categoryExpenses && expenses.categoryExpenses.length > 0 ? (
              <div className="space-y-3">
                {expenses.categoryExpenses.map((cat: any, i: number) => {
                  const pct = Math.round((cat.amount / (expenses.totalExpense || 1)) * 100);
                  return (
                    <div key={cat.category} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-slate-700">{cat.category}</span>
                        <span className="font-bold text-slate-900">
                          ৳{cat.amount.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No category data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION E: RECENT MAINTENANCE ACTIVITIES */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Maintenance Activities</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete historical log of servicing, repairs, and replacements
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Part & Component</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Odometer</th>
                <th className="pb-3">Service Date</th>
                <th className="pb-3">Cost (BDT)</th>
                <th className="pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No recent service activities recorded yet.
                  </td>
                </tr>
              ) : (
                historyRecords.slice(0, 8).map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-900">{rec.partName}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {rec.action}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-medium text-slate-800">
                      {rec.odometer?.toLocaleString()} KM
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(rec.serviceDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 font-semibold text-slate-900">
                      ৳{rec.totalCost?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 text-slate-500 max-w-xs truncate">
                      {rec.notes || rec.brand || '—'}
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
