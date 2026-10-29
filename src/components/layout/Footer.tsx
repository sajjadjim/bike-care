import React from 'react';
import Link from 'next/link';
import { Gauge, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Gauge className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Moto<span className="text-blue-600">Care</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Smart vehicle maintenance tracking platform engineered for motorcycle and car owners in Bangladesh.
            </p>
            <div className="text-xs text-slate-400">
              Primary Currency: BDT (৳) &bull; Distance: Kilometers &bull; Timezone: Asia/Dhaka
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Platform</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/features" className="hover:text-blue-600">Smart Odometer Tracking</Link></li>
              <li><Link href="/features" className="hover:text-blue-600">Engine Oil Life Prediction</Link></li>
              <li><Link href="/features" className="hover:text-blue-600">Parts Lifecycle Catalog</Link></li>
              <li><Link href="/features" className="hover:text-blue-600">Tax Token & Fitness Alerts</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/about" className="hover:text-blue-600">About MotoCare</Link></li>
              <li><a href="#how-it-works" className="hover:text-blue-600">How It Works</a></li>
              <li><a href="#faq" className="hover:text-blue-600">Frequently Asked Questions</a></li>
              <li><a href="/login" className="hover:text-blue-600">Try Demo Sandbox</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Vehicle Types</h3>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="px-2 py-1 bg-slate-100 rounded">Yamaha</span>
              <span className="px-2 py-1 bg-slate-100 rounded">Honda</span>
              <span className="px-2 py-1 bg-slate-100 rounded">Suzuki</span>
              <span className="px-2 py-1 bg-slate-100 rounded">Bajaj</span>
              <span className="px-2 py-1 bg-slate-100 rounded">TVS</span>
              <span className="px-2 py-1 bg-slate-100 rounded">Toyota</span>
              <span className="px-2 py-1 bg-slate-100 rounded">Nissan</span>
              <span className="px-2 py-1 bg-slate-100 rounded">Hyundai</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} MotoCare Platform. Built for precision automotive maintenance.
          </div>
          <div className="flex items-center gap-1">
            Engineered with <Heart className="h-3 w-3 text-red-500 fill-red-500 inline" /> for Bangladeshi motorists
          </div>
        </div>
      </div>
    </footer>
  );
}
