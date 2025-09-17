import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        {children}
        <Toaster />
        <Script
          id="monetag-vignette-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(s){
                s.dataset.zone='9892027';
                s.src='https://groleegni.net/vignette.min.js';
              })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
            `,
          }}
        />
      </body>
    </html>
  );
}
