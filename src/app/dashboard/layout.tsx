'use client';

import React from 'react';
import { VehicleProvider } from '@/context/VehicleContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <VehicleProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </VehicleProvider>
  );
}
