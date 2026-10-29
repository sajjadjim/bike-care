'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Gauge,
  Droplets,
  Calendar,
  FileCheck2,
  TrendingUp,
  Wrench,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Car,
  Bike,
} from 'lucide-react';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does MotoCare predict my next engine oil change date?',
      a: 'MotoCare tracks your odometer history and calculates your rolling average daily distance (KM/day). It compares your remaining kilometers against your daily rate, while also checking your manufacturer calendar deadline (e.g. 3 months). Whichever occurs first is set as your next maintenance due date.',
    },
    {
      q: 'Does it support both motorcycles and cars?',
      a: 'Yes! MotoCare comes pre-loaded with specialized catalogs for motorcycles (Yamaha, Honda, Suzuki, Bajaj, TVS, etc.) and cars (Toyota, Honda, Nissan, Hyundai, Mitsubishi, etc.) with vehicle-specific part categories like chain lube for bikes and cabin AC filters for cars.',
    },
    {
      q: 'What is the "Smart Maintenance Record Replacement" feature?',
      a: 'To maintain extreme database efficiency and rapid dashboard load times, MotoCare maintains one active/latest maintenance state per part and task. When you replace or service a part again, the active status is updated while full audit details can be saved in history.',
    },
    {
      q: 'How does Tax Token and Document tracking work in Bangladesh?',
      a: 'You can record your BRTA Tax Token, Fitness Certificate, Registration, and Insurance expiry dates. MotoCare displays real-time countdown badges: Green (more than 30 days), Yellow (30 days or less remaining), and Red (Expired).',
    },
    {
      q: 'Can I track maintenance expenses in Bangladeshi Taka (BDT)?',
      a: 'Yes, BDT (৳) is the default native currency. You can view total expenses, monthly breakdowns, category splits (Engine, Braking, Tyres, etc.), and even calculate your exact Maintenance Cost per Kilometer.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            Next-Gen Vehicle Maintenance SaaS &bull; Bangladesh Ready
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            Never Miss Your Vehicle <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500">
              Maintenance Again.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Track engine oil, vehicle parts, mileage, maintenance schedules, and important documents from one intelligent dashboard.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all hover:scale-[1.02]"
            >
              Start Tracking Your Vehicle
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              Explore Features & Demo
            </Link>
          </div>

          {/* Key Value Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Motorcycles & Cars
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Engine Oil Life Prediction
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              BRTA Tax Token Reminders
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              BDT (৳) Expense Analytics
            </div>
          </div>
        </div>

        {/* 2. DASHBOARD PREVIEW MOCKUP */}
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-14">
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-3 shadow-2xl backdrop-blur-xl ring-1 ring-slate-900/5">
            <div className="rounded-xl bg-slate-900 text-white p-5 sm:p-7 shadow-inner">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Bike className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">Phantom R15 V4</h2>
                      <span className="text-xs font-mono bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50">
                        Dhaka Metro LA-55-9012
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Yamaha &bull; 155 CC &bull; 11,500 KM &bull; Avg. 30 KM/Day
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1 text-xs font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    All Systems Healthy
                  </span>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Engine Oil Life</span>
                    <Droplets className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">1,500 KM Remaining</div>
                  <div className="mt-2 text-xs text-slate-400">Next Service: ~50 Days (Distance Limit)</div>
                  <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>

                <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Drive Chain Service</span>
                    <Wrench className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-400">150 KM Remaining</div>
                  <div className="mt-2 text-xs text-slate-400">Status: Approaching Service</div>
                  <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-amber-400 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>BRTA Tax Token</span>
                    <FileCheck2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">47 Days Remaining</div>
                  <div className="mt-2 text-xs text-slate-400">Expires: 15 Dec 2026 (Valid)</div>
                  <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 & 4. FEATURES SECTION */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
              SaaS Capabilities
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Built for precision, engineered for reliability.
            </p>
            <p className="mt-4 text-base text-slate-600">
              Every detail is designed to solve real-world problems faced by motorcycle and car owners in Bangladesh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-8 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Droplets className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Engine Oil Monitoring</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Dedicated oil tracking module recording viscosity (e.g. 10W-40), mineral vs synthetic specifications, oil filter changes, and dynamic dual predictions.
              </p>
              <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                Calculates remaining KM & days <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-8 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gauge className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Odometer & Mileage</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Calculates your true rolling average daily distance without inventing fake data. Includes full audit-controlled odometer correction workflows.
              </p>
              <div className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                Zero estimation guesswork <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-8 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Tax Token & Fitness Alerts</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Color-coded validity tracker for Bangladeshi BRTA Tax Tokens, Fitness Certificates, Route Permits, and Insurance with customizable reminders.
              </p>
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                Avoid penalty checkpoints <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-8 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Comprehensive Parts Catalog</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Over 30+ pre-configured motorcycle and car parts spanning Engine, Brakes, Transmission, Tyres, Suspension, and AC, plus support for custom parts.
              </p>
              <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                Standard & custom components <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-8 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Expense Analytics (BDT ৳)</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Interactive charts visualizing monthly expenditure, category breakdowns, and maintenance cost per kilometer driven.
              </p>
              <div className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                Recharts visual breakdown <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-8 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Smart State Storage</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Optimized MongoDB architecture maintaining one active state per vehicle part & task to prevent database bloat while logging full history.
              </p>
              <div className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                Scalable SaaS architecture <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
              Simple 4-Step Flow
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              How MotoCare works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-4 text-sm">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Register Vehicle</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select motorcycle or car, choose manufacturer, dynamic model, CC, fuel type, and current odometer.
              </p>
            </div>

            <div className="relative bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-4 text-sm">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Record Service</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log engine oil changes, brake pads, chain cleanings, or repairs with dates, costs, and odometer readings.
              </p>
            </div>

            <div className="relative bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-4 text-sm">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Update Odometer</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log readings whenever you ride. The platform automatically calculates your rolling daily average.
              </p>
            </div>

            <div className="relative bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-4 text-sm">
                4
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Get Smart Alerts</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive proactive warnings before maintenance is overdue and before tax tokens expire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ SECTION */}
      <section id="faq" className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">Questions?</h2>
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-base">{faq.q}</span>
                  <ChevronRight
                    className={`h-5 w-5 text-slate-400 transition-transform ${
                      activeFaq === i ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-4 pt-1 text-sm text-slate-600 border-t border-slate-100 bg-slate-50/50 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="py-20 bg-gradient-to-tr from-slate-900 via-slate-850 to-blue-950 text-white text-center">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Take Control of Your Vehicle Today.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Join motorcycle riders and car owners who track their maintenance schedules with automated precision.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl hover:bg-blue-500 transition-all"
            >
              Start Free Today
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-8 py-3.5 text-base font-semibold text-white hover:bg-slate-800 transition-all"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
