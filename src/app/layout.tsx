'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import * as React from 'react';

const YouTubePlayer = React.memo(function YouTubePlayer({ videoId }: { videoId: string }) {
  if (!videoId) return null;
  return (
    <iframe
      className="w-full h-full border-none"
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    ></iframe>
  );
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [youtubeVideoId, setYoutubeVideoId] = React.useState('jfKfPfyJRdk'); // Default video

  React.useEffect(() => {
    // This effect runs once on the client to get the initial value
    const storedVideoId = sessionStorage.getItem('youtubeVideoId');
    if (storedVideoId) {
      setYoutubeVideoId(storedVideoId);
    }

    // This listens for changes triggered from the entertainment page
    const handleVideoChange = () => {
      const newVideoId = sessionStorage.getItem('youtubeVideoId');
      if (newVideoId && newVideoId !== youtubeVideoId) {
        setYoutubeVideoId(newVideoId);
      }
    };

    window.addEventListener('youtubeVideoChange', handleVideoChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('youtubeVideoChange', handleVideoChange);
    };
  }, [youtubeVideoId]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <div className="flex flex-col h-screen">
            {children}
            <footer className="h-32 flex-shrink-0 border-t bg-background">
                <YouTubePlayer videoId={youtubeVideoId} />
            </footer>
        </div>

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
