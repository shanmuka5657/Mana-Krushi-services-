'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import * as React from 'react';
import { logVisit } from '@/lib/storage';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const ConditionalFooter = dynamic(
  () => import('@/components/layout/conditional-footer'),
  { ssr: false }
);


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  React.useEffect(() => {
    const registerSyncs = async () => {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          
          // --- Periodic Background Sync Registration ---
          // @ts-ignore
          const periodicSyncPerm = await navigator.permissions.query({ name: 'periodic-background-sync' });
          if (periodicSyncPerm.state === 'granted') {
            await registration.periodicSync.register('get-latest-data', {
              minInterval: 12 * 60 * 60 * 1000, // 12 hours
            });
            console.log('Periodic Background Sync registered.');
          } else {
            console.log('Periodic Background Sync permission not granted.');
          }

        } catch (error) {
          console.error('Error during sync registration:', error);
        }
      }
    };
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          registerSyncs(); // Register syncs after service worker is ready
        })
        .catch((error) => console.error('Service Worker registration failed:', error));
    }
  }, []);

  React.useEffect(() => {
    logVisit(pathname);
  }, [pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#1f83bd" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster />
        <ConditionalFooter />
      </body>
    </html>
  );
}
