import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SystemDataProvider } from '@/context/SystemDataContext';

export const metadata: Metadata = {
  title: 'Class Optima - Smart Student & Timetable Management',
  description: 'Enterprise Student Management System with automated credentials generation, attendance tracking, leave approval workflow, and rich statistical analytics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-[#f4f7fb] text-slate-800 antialiased font-['Plus_Jakarta_Sans',sans-serif]">
        <AuthProvider>
          <SystemDataProvider>
            {children}
          </SystemDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
