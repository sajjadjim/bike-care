'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { IVehicle } from '@/types';

interface VehicleContextType {
  vehicles: IVehicle[];
  activeVehicle: IVehicle | null;
  loading: boolean;
  refreshVehicles: () => Promise<void>;
  selectVehicle: (id: string) => void;
  updateActiveOdometer: (newReading: number) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<IVehicle | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshVehicles = useCallback(async () => {
    if (!user) {
      setVehicles([]);
      setActiveVehicle(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/vehicles', {
        headers: {
          Authorization: `Bearer ${token || (user.isDemo ? `demo-${user.uid}` : '')}`,
          'x-demo-user-id': user.uid,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const list: IVehicle[] = data.vehicles || [];
        setVehicles(list);

        // If previously selected vehicle still exists, keep it
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('motocare_active_vehicle_id') : null;
        const found = list.find((v) => v._id === savedId) || list[0] || null;
        setActiveVehicle(found);
      }
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    refreshVehicles();
  }, [refreshVehicles]);

  const selectVehicle = (id: string) => {
    const v = vehicles.find((item) => item._id === id);
    if (v) {
      setActiveVehicle(v);
      if (typeof window !== 'undefined') {
        localStorage.setItem('motocare_active_vehicle_id', id);
      }
    }
  };

  const updateActiveOdometer = (newReading: number) => {
    if (activeVehicle) {
      const updated = { ...activeVehicle, currentOdometer: newReading };
      setActiveVehicle(updated);
      setVehicles((prev) => prev.map((v) => (v._id === activeVehicle._id ? updated : v)));
    }
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        activeVehicle,
        loading,
        refreshVehicles,
        selectVehicle,
        updateActiveOdometer,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error('useVehicle must be used within VehicleProvider');
  return ctx;
}
