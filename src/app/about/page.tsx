import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Target, Users, MapPin, Gauge } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Our Vision
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              About MotoCare Platform
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Transforming vehicle ownership in Bangladesh through automated maintenance intelligence.
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 space-y-6 leading-relaxed">
            <p className="text-lg font-medium text-slate-800">
              In Bangladesh, maintaining motorcycles and cars often relies on memory, scattered paper receipts, and informal garage reminders. Overdue oil changes lead to engine seizures, neglected brake pads lead to dangerous brake fade on highways, and expired BRTA tax tokens result in heavy traffic fines.
            </p>

            <p>
              <strong>MotoCare</strong> was architected as a commercial-grade SaaS solution specifically tailored for this landscape. With native support for Bangladeshi currency (BDT ৳), distance in kilometers, local timezone (Asia/Dhaka), and vehicle models prominent across Bangladesh (Yamaha R15, MT-15, Honda CB Hornet, Toyota Corolla, Allion, Premio), MotoCare puts you in complete control of your vehicle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50">
              <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-4">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Our Mission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Empower every vehicle owner with accurate predictive scheduling, reducing unexpected breakdowns by up to 80%.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50">
              <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Road Safety</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Timely replacement of critical safety components — brake pads, fluids, tyres, and suspension — saves lives on the road.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50">
              <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-4">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Built for BD</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pre-configured for local fuel grades, dust conditions, BRTA compliance documents, and authentic local parts.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 text-white p-8 text-center sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to elevate your vehicle upkeep?</h2>
            <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Experience the smarter way to maintain your bike or car with automated predictions and lifetime records.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition-all"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
