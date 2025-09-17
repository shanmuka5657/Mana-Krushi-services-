
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import VignetteAd from '@/components/VignetteAd';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <VignetteAd />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
