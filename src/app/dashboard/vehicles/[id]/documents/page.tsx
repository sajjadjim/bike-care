'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import { DocumentType } from '@/types';
import {
  FileCheck2,
  PlusCircle,
  AlertTriangle,
  Calendar,
  Trash2,
  CheckCircle2,
  Clock,
  X,
  FileText,
} from 'lucide-react';

export default function VehicleDocumentsPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { user, token } = useAuth();
  const { activeVehicle } = useVehicle();

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New Document Form
  const [documentType, setDocumentType] = useState<DocumentType>('TAX_TOKEN');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [renewalCost, setRenewalCost] = useState<number | string>(2300);
  const [reminderDaysBefore, setReminderDaysBefore] = useState<number | string>(30);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDocs = useCallback(async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/documents?vehicleId=${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, token, user]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expiryDate) return;
    setSaving(true);

    try {
      const payload = {
        vehicleId,
        documentType,
        documentNumber: documentNumber || undefined,
        issueDate: issueDate || undefined,
        expiryDate,
        renewalCost: Number(renewalCost) || 0,
        reminderDaysBefore: Number(reminderDaysBefore) || 30,
        notes: notes || undefined,
      };

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        await fetchDocs();
      }
    } catch (err) {
      console.error('Failed to save document:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (docType: string) => {
    if (!confirm(`Delete ${docType} tracker for this vehicle?`)) return;
    try {
      await fetch(`/api/documents?vehicleId=${vehicleId}&docType=${docType}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || (user?.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user?.uid || '',
        },
      });
      await fetchDocs();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Vehicle Documents & BRTA Validity
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor BRTA Tax Token, Fitness, Insurance, and Registration validity with proactive color-coded countdown alerts.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add / Update Document
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
            No document validity records tracked yet. Click &quot;Add / Update Document&quot; to configure.
          </div>
        ) : (
          documents.map((doc) => {
            const isExpired = doc.status === 'EXPIRED';
            const isExpiringSoon = doc.status === 'EXPIRING_SOON';

            return (
              <div
                key={doc._id}
                className={`rounded-2xl border bg-white p-5 shadow-sm flex flex-col justify-between transition-all ${
                  isExpired
                    ? 'border-red-300 ring-2 ring-red-100'
                    : isExpiringSoon
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : 'border-emerald-300 ring-1 ring-emerald-100'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                          isExpired
                            ? 'bg-red-100 text-red-600'
                            : isExpiringSoon
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {doc.documentType.replace('_', ' ')}
                        </h3>
                        <div className="text-[10px] font-mono text-slate-500">
                          {doc.documentNumber || 'No Doc Number'}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isExpired
                          ? 'bg-red-100 text-red-700'
                          : isExpiringSoon
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs mb-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500">Validity Remaining:</span>
                      <span
                        className={`text-base font-extrabold ${
                          isExpired
                            ? 'text-red-600'
                            : isExpiringSoon
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {isExpired
                          ? `Expired (${Math.abs(doc.remainingDays)} days ago)`
                          : `${doc.remainingDays} Days Left`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expiration Date:</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(doc.expiryDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    {doc.renewalCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Estimated Renewal:</span>
                        <span className="font-bold text-slate-900">
                          ৳{doc.renewalCost.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {doc.notes && (
                    <p className="text-[11px] text-slate-500 italic mb-2">
                      &quot;{doc.notes}&quot;
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    Threshold: &le;{doc.reminderDaysBefore || 30} days
                  </span>
                  <button
                    onClick={() => handleDelete(doc.documentType)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove document tracking"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Track Vehicle Document</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Type *
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="TAX_TOKEN">BRTA Tax Token</option>
                  <option value="FITNESS">Fitness Certificate</option>
                  <option value="INSURANCE">Insurance Policy</option>
                  <option value="REGISTRATION">Registration Certificate</option>
                  <option value="ROUTE_PERMIT">Route Permit</option>
                  <option value="OTHER">Other Official Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document / Certificate Number
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="e.g. BRTA-TT-2024-99812"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Renewal Cost (BDT ৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={renewalCost}
                    onChange={(e) => setRenewalCost(e.target.value)}
                    placeholder="৳2300"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warning Days Before
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={reminderDaysBefore}
                    onChange={(e) => setReminderDaysBefore(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / BRTA Circle
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Dhaka Metro Mirpur BRTA Circle"
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
                  {saving ? 'Saving...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
