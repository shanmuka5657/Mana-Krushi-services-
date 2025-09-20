
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
  const [loadAds, setLoadAds] = React.useState(false);

  React.useEffect(() => {
    logVisit(pathname);
  }, [pathname]);

  React.useEffect(() => {
    // Only load ads if the hostname is not the development site
    if (window.location.hostname !== 'studio.firebase.google.com') {
      setLoadAds(true);
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
            <ConditionalFooter />
        </div>
        <Toaster />
        {loadAds && (
          <>
            <Script id="monetag-vignette" strategy="afterInteractive">
              {`(function(s){s.dataset.zone='9892027',s.src='https://groleegni.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
            </Script>
            <Script id="monetag-tag1" strategy="afterInteractive">
              {`(function(s){s.dataset.zone='9892058',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
            </Script>
            <Script id="monetag-tag2" strategy="afterInteractive">
              {`(function(s){s.dataset.zone='9904124',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
