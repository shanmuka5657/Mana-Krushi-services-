
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
  }, [pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
          <Script async src="//x7i0.com/tag.min.js" data-zone="9905911" data-cfasync="false" strategy="afterInteractive" />
      </head>
      <body>
        {children}
        <Toaster />
        <ConditionalFooter />
        <Script type='text/javascript' src='//markswaitingrouge.com/8d/62/5f/8d625f6c0ee1cd63f181069e4d8bab94.js' strategy="afterInteractive" />
      </body>
    </html>
  );
}
