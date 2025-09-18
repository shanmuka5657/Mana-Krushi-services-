'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import * as React from 'react';
import { onGlobalVideoUrlChange } from '@/lib/storage';

const VideoPlayer = React.memo(function VideoPlayer({ embedUrl }: { embedUrl: string }) {
  if (!embedUrl) return null;

  const getYouTubeVideoId = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/embed/')) {
        return urlObj.pathname.split('/embed/')[1];
      }
    } catch (e) {
      // Ignore invalid URLs
    }
    return null;
  };

  const videoId = getYouTubeVideoId(embedUrl);

  if (!videoId) {
    // Optionally handle non-YouTube URLs or invalid URLs here
    // For now, we just won't render the player
    return null;
  }

  const playerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;

  return (
    <iframe
      className="w-full h-full border-none"
      src={playerUrl}
      title="Background video player"
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
  const [videoUrl, setVideoUrl] = React.useState('https://www.youtube.com/embed/jfKfPfyJRdk');

  React.useEffect(() => {
    const unsubscribe = onGlobalVideoUrlChange((newUrl: string) => {
        if (newUrl && newUrl !== videoUrl) {
            setVideoUrl(newUrl);
        }
    });

    return () => unsubscribe();
  }, [videoUrl]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <div className="flex flex-col h-screen">
            {children}
            <footer className="h-32 flex-shrink-0 border-t bg-background">
                <VideoPlayer embedUrl={videoUrl} />
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
      </body>
    </html>
  );
}
