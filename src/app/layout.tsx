
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import * as React from 'react';
import { logVisit } from '@/lib/storage';
import dynamic from 'next/dynamic';
import Script from 'next/script';
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <Script
          src="https://fpyf8.com/88/tag.min.js"
          data-zone="171777"
          data-cfasync="false"
          async
        />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `(function(s){s.dataset.zone='9896290',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))` }} />
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
