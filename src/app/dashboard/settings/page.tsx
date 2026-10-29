'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { User, Mail, Globe, DollarSign, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.displayName || 'Vehicle Owner');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Account & Platform Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage user profile details, regional localization, distance units, and preferences.
        </p>
      </div>

      {saved && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Settings saved successfully.
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">User Profile</h2>
        <form onSubmit={handleSave} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                disabled
                value={user?.email || 'user@motocare.app'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Managed through Firebase Authentication
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold shadow transition-colors"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>

      {/* Regional & Localization Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-1">Regional Defaults</h2>
        <p className="text-xs text-slate-500 mb-4">
          Pre-configured specifically for Bangladeshi automotive operations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="font-semibold">Native Currency</span>
            </div>
            <div className="text-base font-bold text-slate-900">BDT (৳)</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Bangladeshi Taka</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Globe className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold">Distance Unit</span>
            </div>
            <div className="text-base font-bold text-slate-900">Kilometers (KM)</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Metric standard</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="font-semibold">Timezone</span>
            </div>
            <div className="text-base font-bold text-slate-900">Asia/Dhaka</div>
            <div className="text-[10px] text-slate-400 mt-0.5">UTC +6:00</div>
          </div>
        </div>
      </div>
    </div>
  );
}
