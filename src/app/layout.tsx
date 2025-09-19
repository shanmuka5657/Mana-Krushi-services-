
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import * as React from 'react';
import { incrementVisitorCount } from '@/lib/storage';
import dynamic from 'next/dynamic';
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

  React.useEffect(() => {
    const trackVisitor = async () => {
        if (!sessionStorage.getItem('visitor_tracked')) {
            await incrementVisitorCount();
            sessionStorage.setItem('visitor_tracked', 'true');
        }
    };
    trackVisitor();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <script async src="https://al5sm.com/tag.min.js" data-zone="9892058"></script>
      </head>
      <body>
        <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
            <ConditionalFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
