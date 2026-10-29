import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';

export const metadata: Metadata = {
  title: 'MotoCare — Smart Vehicle Maintenance Management Platform',
  description:
    'Intelligent maintenance tracking, engine oil prediction, parts catalog, mileage tracking and tax token alerts for motorcycle and car owners.',
  keywords: [
    'vehicle maintenance',
    'motorcycle service tracker',
    'car maintenance SaaS',
    'engine oil change reminder',
    'tax token expiry Bangladesh',
    'odometer tracker',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
