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
      </body>
    </html>
  );
}
