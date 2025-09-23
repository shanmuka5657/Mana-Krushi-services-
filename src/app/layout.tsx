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
    logVisit(pathname);

    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(async (registration) => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
                
                // --- Periodic Background Sync Registration (Educational) ---
                // Check if the Periodic Sync API is available.
                if ('periodicSync' in registration) {
                    try {
                        // Request permission from the user for periodic sync.
                        // @ts-ignore
                        const status = await navigator.permissions.query({name: 'periodic-background-sync'});
                        if (status.state === 'granted') {
                            // If permission is granted, register a sync event.
                            await registration.periodicSync.register('get-promoted-rides', {
                                // Set the minimum interval to 12 hours. The browser will decide the actual frequency.
                                minInterval: 12 * 60 * 60 * 1000, 
                            });
                            console.log('Periodic Sync registered for get-promoted-rides');
                        } else {
                            console.log('Periodic Sync permission not granted.');
                        }
                    } catch (error) {
                        console.error('Periodic Sync registration failed:', error);
                    }
                }
                
                // Force service worker to check for updates on page load
                registration.update();
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

  }, [pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#1E88E5" />
      </head>
      <body>
        {children}
        <Toaster />
        <ConditionalFooter />
      </body>
    </html>
  );
}
