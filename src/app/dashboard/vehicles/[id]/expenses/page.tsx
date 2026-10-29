'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Layers,
  Wrench,
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

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function ExpensesAnalyticsPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { user, token } = useAuth();
  const { activeVehicle } = useVehicle();

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/expenses?vehicleId=${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, token, user]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Maintenance Expense Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed financial reports in Bangladeshi Taka (BDT ৳) with cost per kilometer metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Expenditure</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ৳{analytics?.totalExpense?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">All logged servicing</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Parts Cost</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            ৳{analytics?.totalPartsExpense?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Components & materials</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Labor & Service</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ৳{analytics?.totalLaborExpense?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Garage labor charges</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Cost Per Kilometer</span>
          <div className="text-2xl font-black text-purple-600 font-mono mt-1">
            ৳{analytics?.costPerKM || 0}/KM
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across odometer life</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Expenses Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Monthly Spending Trend (৳)</h2>
          <p className="text-xs text-slate-500 mb-6">
            Monthly aggregate maintenance expenditure
          </p>

          {analytics?.monthlyExpenses && analytics.monthlyExpenses.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyExpenses}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip
                    formatter={(val: any) => [`৳${val.toLocaleString()}`, 'Total Spent']}
                    contentStyle={{ borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              No monthly records available yet.
            </div>
          )}
        </div>

        {/* Category Split */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Spending by Category</h2>
          <p className="text-xs text-slate-500 mb-6">
            Proportional cost distribution
          </p>

          {analytics?.categoryExpenses && analytics.categoryExpenses.length > 0 ? (
            <div className="space-y-4">
              {analytics.categoryExpenses.map((cat: any, i: number) => {
                const pct = Math.round(
                  (cat.amount / (analytics.totalExpense || 1)) * 100
                );
                return (
                  <div key={cat.category} className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">{cat.category}</span>
                      <span className="font-bold text-slate-900">
                        ৳{cat.amount.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              No category data available.
            </div>
          )}
        </div>
      </div>

      {/* Transaction Log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">Maintenance Cost Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Component / Part</th>
                <th className="pb-3">Service Date</th>
                <th className="pb-3">Parts Cost</th>
                <th className="pb-3">Labor Charge</th>
                <th className="pb-3 text-right">Total (BDT ৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics?.records && analytics.records.length > 0 ? (
                analytics.records.map((r: any) => (
                  <tr key={r._id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-900">{r.partName}</td>
                    <td className="py-3 text-slate-500">
                      {new Date(r.serviceDate || r.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 text-slate-700 font-mono">
                      ৳{r.partsCost?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 text-slate-700 font-mono">
                      ৳{r.laborCost?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 text-right font-black text-slate-900">
                      ৳{r.totalCost?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
