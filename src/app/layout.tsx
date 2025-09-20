
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
    
    // Defer ad script injection to client-side only, after hydration
    const scripts = [
      { dataset: { zone: '9896290' }, src: 'https://al5sm.com/tag.min.js' },
      { dataset: { zone: '9892027' }, src: 'https://groleegni.net/vignette.min.js' },
      { dataset: { zone: '9894293' }, src: 'https://forfrogadiertor.com/tag.min.js' }
    ];

    scripts.forEach(scriptInfo => {
      const s = document.createElement('script');
      s.src = scriptInfo.src;
      Object.keys(scriptInfo.dataset).forEach(key => {
        s.dataset[key] = scriptInfo.dataset[key as keyof typeof scriptInfo.dataset];
      });
      document.body.appendChild(s);
    });

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
