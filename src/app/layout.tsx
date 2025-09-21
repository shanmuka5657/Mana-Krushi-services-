
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
  }, [pathname]);

  React.useEffect(() => {
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.src = '//markswaitingrouge.com/8d/62/5f/8d625f6c0ee1cd63f181069e4d8bab94.js';
    script1.async = true;
    
    document.body.appendChild(script1);

    return () => {
      if (document.body.contains(script1)) {
        document.body.removeChild(script1);
      }
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
