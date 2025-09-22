'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import * as React from 'react';
import { logVisit } from '@/lib/storage';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

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
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
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
