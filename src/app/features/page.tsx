import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Droplets, Gauge, Wrench, ShieldCheck, FileCheck2, BarChart3, Clock, AlertTriangle, Layers } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Deep Dive
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Engineered for Complete Vehicle Health
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Explore the engineering and features powering MotoCare&apos;s intelligent maintenance management platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Droplets className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Engine Oil Management Module</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Engine oil is the lifeblood of internal combustion engines. MotoCare tracks:
              </p>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-center gap-2">&bull; Viscosity grade (10W-30, 10W-40, 20W-50, 5W-30)</li>
                <li className="flex items-center gap-2">&bull; Oil composition (Mineral, Semi-Synthetic, Fully Synthetic)</li>
                <li className="flex items-center gap-2">&bull; Usage percentage gauge with remaining kilometer countdown</li>
                <li className="flex items-center gap-2">&bull; Dual comparison: Distance limit vs Calendar deadline</li>
              </ul>
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-800">
                <strong>Safety First:</strong> Recommends adhering to your vehicle manufacturer manual rather than arbitrary oil marketing claims.
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Gauge className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Smart Odometer & Mileage Tracking</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Accurate maintenance relies on real mileage data:
              </p>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-center gap-2">&bull; Manual odometer updates with automatic date timestamping</li>
                <li className="flex items-center gap-2">&bull; Chronological rolling daily average calculation (KM/day)</li>
                <li className="flex items-center gap-2">&bull; Detection of outlier readings and duplicate timestamps</li>
                <li className="flex items-center gap-2">&bull; Controlled odometer correction workflow with audit reasons</li>
              </ul>
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs text-indigo-800">
                <strong>No Fake Data:</strong> If driving data is insufficient, MotoCare clearly labels predictions as estimates without fabricating false rates.
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">BRTA Document & Tax Token Tracker</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Ensure compliance with Bangladeshi road safety regulations:
              </p>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-center gap-2">&bull; BRTA Tax Token expiration countdown</li>
                <li className="flex items-center gap-2">&bull; Fitness Certificate renewal alerts for commercial & private cars</li>
                <li className="flex items-center gap-2">&bull; 1st & 3rd party Insurance validity tracking</li>
                <li className="flex items-center gap-2">&bull; Renewal fee estimation and archive records</li>
              </ul>
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs text-emerald-800">
                <strong>Dynamic Status:</strong> Green (&gt;30 days), Amber (&le;30 days), Red (Expired).
              </div>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Maintenance Cost Analytics in BDT</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Understand where your maintenance budget goes:
              </p>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-center gap-2">&bull; Parts cost vs labor & service charge breakdown</li>
                <li className="flex items-center gap-2">&bull; Interactive monthly spending bar charts powered by Recharts</li>
                <li className="flex items-center gap-2">&bull; Category expenditure distribution (Engine, Brakes, Suspension, AC)</li>
                <li className="flex items-center gap-2">&bull; Real-time Cost per Kilometer calculation (৳/KM)</li>
              </ul>
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-lg text-xs text-purple-800">
                <strong>Financial Visibility:</strong> Make informed decisions on vehicle upkeep and resale value.
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all"
            >
              Start Free Trial Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
