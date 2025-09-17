import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import PopunderAd from '@/components/ads/popunder-ad';

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
        <PopunderAd />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
