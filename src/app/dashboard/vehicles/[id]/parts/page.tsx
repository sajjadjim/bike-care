'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import {
  Layers,
  Search,
  PlusCircle,
  Wrench,
  Clock,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';

export default function PartsCatalogPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { user, token } = useAuth();
  const { activeVehicle } = useVehicle();

  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  // New Custom Part form
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Engine');
  const [customDescription, setCustomDescription] = useState('');
  const [customInspectionKM, setCustomInspectionKM] = useState('');
  const [customReplacementKM, setCustomReplacementKM] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchParts = useCallback(async () => {
    try {
      setLoading(true);
      const typeParam = activeVehicle?.type ? `type=${activeVehicle.type}` : '';
      const res = await fetch(`/api/parts?${typeParam}`);
      if (res.ok) {
        const data = await res.json();
        setParts(data.parts || []);
      }
    } catch (err) {
      console.error('Failed to load parts:', err);
    } finally {
      setLoading(false);
    }
  }, [activeVehicle]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const categories = ['ALL', ...Array.from(new Set(parts.map((p) => p.category)))];

  const filtered = parts.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddCustomPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    setSaving(true);

    try {
      const res = await fetch('/api/parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
        body: JSON.stringify({
          name: customName,
          category: customCategory,
          vehicleType: activeVehicle?.type || 'all',
          description: customDescription,
          suggestedInspectionIntervalKM: customInspectionKM ? Number(customInspectionKM) : undefined,
          suggestedReplacementIntervalKM: customReplacementKM ? Number(customReplacementKM) : undefined,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setCustomName('');
        setCustomDescription('');
        await fetchParts();
      }
    } catch (err) {
      console.error('Failed to add custom part:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Parts & Components Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard OEM intervals, maintenance actions, and component lifecycle specifications.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add Custom Part
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parts by name, category, or description..."
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((part) => (
          <div
            key={part.partId}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {part.category}
                </span>
                {part.isCustom && (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                    Custom
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">{part.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                {part.description || 'Standard vehicle component.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
              {part.suggestedReplacementIntervalKM && (
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Replace Interval:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {part.suggestedReplacementIntervalKM.toLocaleString()} KM
                  </span>
                </div>
              )}
              {part.suggestedInspectionIntervalKM && (
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Inspect Interval:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {part.suggestedInspectionIntervalKM.toLocaleString()} KM
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Part Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Custom Part</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomPart} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Part Name *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Performance Exhaust Gasket"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Engine, Exhaust, Electrical"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Suggested Replacement Interval (KM)
                </label>
                <input
                  type="number"
                  min="500"
                  value={customReplacementKM}
                  onChange={(e) => setCustomReplacementKM(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Brief description of part function..."
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
                  className="rounded-lg bg-blue-600 text-white px-5 py-2 text-xs font-bold shadow hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
