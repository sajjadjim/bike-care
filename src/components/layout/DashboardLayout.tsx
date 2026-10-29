'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useVehicle } from '@/context/VehicleContext';
import { QuickOdometerModal } from '@/components/dashboard/QuickOdometerModal';
import {
  LayoutDashboard,
  Car,
  Wrench,
  Droplets,
  Layers,
  Gauge,
  FileCheck2,
  TrendingUp,
  Bell,
  Settings,
  ChevronDown,
  PlusCircle,
  Menu,
  X,
  LogOut,
  Calendar,
  Sparkles,
  Bike,
} from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { vehicles, activeVehicle, selectVehicle } = useVehicle();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vehicleMenuOpen, setVehicleMenuOpen] = useState(false);
  const [odometerModalOpen, setOdometerModalOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    // Fetch unread notifications count
    if (user) {
      fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${user.isDemo ? `demo-${user.uid}` : ''}`,
          'x-demo-user-id': user.uid,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.unreadCount === 'number') {
            setUnreadNotifCount(data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [user, pathname]);

  const vehicleId = activeVehicle?._id || 'all';

  const navLinks = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      name: 'My Vehicles',
      href: '/dashboard/vehicles',
      icon: Car,
      active: pathname === '/dashboard/vehicles' || pathname.startsWith('/dashboard/vehicles/add'),
    },
    {
      name: 'Maintenance',
      href: activeVehicle ? `/dashboard/vehicles/${vehicleId}/maintenance` : '/dashboard/vehicles',
      icon: Wrench,
      active: pathname.includes('/maintenance'),
    },
    {
      name: 'Engine Oil',
      href: activeVehicle ? `/dashboard/vehicles/${vehicleId}/engine-oil` : '/dashboard/vehicles',
      icon: Droplets,
      active: pathname.includes('/engine-oil'),
    },
    {
      name: 'Parts Catalog',
      href: activeVehicle ? `/dashboard/vehicles/${vehicleId}/parts` : '/dashboard/vehicles',
      icon: Layers,
      active: pathname.includes('/parts'),
    },
    {
      name: 'Odometer',
      href: activeVehicle ? `/dashboard/vehicles/${vehicleId}/odometer` : '/dashboard/vehicles',
      icon: Gauge,
      active: pathname.includes('/odometer'),
    },
    {
      name: 'Documents & BRTA',
      href: activeVehicle ? `/dashboard/vehicles/${vehicleId}/documents` : '/dashboard/vehicles',
      icon: FileCheck2,
      active: pathname.includes('/documents'),
    },
    {
      name: 'Expenses & Analytics',
      href: activeVehicle ? `/dashboard/vehicles/${vehicleId}/expenses` : '/dashboard/vehicles',
      icon: TrendingUp,
      active: pathname.includes('/expenses'),
    },
    {
      name: 'Schedule Matrix',
      href: activeVehicle ? `/dashboard/vehicles/${vehicleId}/schedule` : '/dashboard/vehicles',
      icon: Calendar,
      active: pathname.includes('/schedule'),
    },
    {
      name: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
      badge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
      active: pathname === '/dashboard/notifications',
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      active: pathname === '/dashboard/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Quick Odometer Update Modal */}
      <QuickOdometerModal
        isOpen={odometerModalOpen}
        onClose={() => setOdometerModalOpen(false)}
      />

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white shrink-0 sticky top-0 h-screen z-40">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Moto<span className="text-blue-600">Care</span>
            </span>
            <span className="ml-1 text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
              PRO
            </span>
          </div>
        </div>

        {/* Active Vehicle Selector in Sidebar */}
        <div className="p-3 border-b border-slate-100 relative">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
            Active Vehicle
          </div>
          {activeVehicle ? (
            <div className="relative">
              <button
                onClick={() => setVehicleMenuOpen(!vehicleMenuOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    {activeVehicle.type === 'motorcycle' ? (
                      <Bike className="h-4 w-4" />
                    ) : (
                      <Car className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {activeVehicle.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      {activeVehicle.currentOdometer.toLocaleString()} KM
                    </div>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
              </button>

              {vehicleMenuOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                  {vehicles.map((v) => (
                    <button
                      key={v._id}
                      onClick={() => {
                        selectVehicle(v._id!);
                        setVehicleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs ${
                        v._id === activeVehicle._id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{v.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {v.currentOdometer.toLocaleString()} KM
                      </span>
                    </button>
                  ))}
                  <div className="pt-1 border-t border-slate-100">
                    <Link
                      href="/dashboard/vehicles/add"
                      onClick={() => setVehicleMenuOpen(false)}
                      className="w-full flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add New Vehicle
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/dashboard/vehicles/add"
              className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              Register First Vehicle
            </Link>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  item.active
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.active ? 'bg-white text-blue-700' : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {user?.displayName || 'Vehicle Owner'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.isDemo ? 'Demo Mode' : user?.email}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              title="Sign Out"
              className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 md:hidden text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Quick Vehicle info on header */}
            {activeVehicle && (
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-900">{activeVehicle.name}</span>
                <span className="text-slate-300">&bull;</span>
                <span className="font-mono text-slate-500">
                  {activeVehicle.registrationNumber}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="font-mono font-semibold text-blue-600">
                  {activeVehicle.currentOdometer.toLocaleString()} KM
                </span>
              </div>
            )}
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            {activeVehicle && (
              <button
                onClick={() => setOdometerModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100/80 px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                <Gauge className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Log Odometer</span>
              </button>
            )}

            {activeVehicle && (
              <Link
                href={`/dashboard/vehicles/${vehicleId}/maintenance/add`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add Service</span>
              </Link>
            )}

            <Link
              href="/dashboard/notifications"
              className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-72 bg-white h-full z-10 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Gauge className="h-4 w-4" />
                </div>
                <span className="text-base font-bold text-slate-900">
                  Moto<span className="text-blue-600">Care</span>
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                      item.active
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
