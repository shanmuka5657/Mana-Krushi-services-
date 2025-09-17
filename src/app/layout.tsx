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
        <Script id="service-worker-registration">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                  console.log('SW registered: ', registration);
                }).catch(registrationError => {
                  console.log('SW registration failed: ', registrationError);
                });
              });
            }
          `}
        </Script>
        <Script 
          src="https://fpyf8.com/88/tag.min.js" 
          data-zone="171777" 
          async 
          data-cfasync="false"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
