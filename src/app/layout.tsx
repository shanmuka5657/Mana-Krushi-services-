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
        <script
          data-cfasync="false"
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(s=>{s.dataset.zone='9892058',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        ></script>
      </body>
    </html>
  );
}
