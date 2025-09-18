
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
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

const ClientOnlyVideoPlayer = () => {
    const [videoUrl, setVideoUrl] = React.useState('https://www.youtube.com/embed/jfKfPfyJRdk');
    const [isClient, setIsClient] = React.useState(false);
    
    React.useEffect(() => {
        setIsClient(true);
        const unsubscribe = onGlobalVideoUrlChange((newUrl: string) => {
            if (newUrl && newUrl !== videoUrl) {
                setVideoUrl(newUrl);
            }
        });

        return () => unsubscribe();
    }, [videoUrl]);

    if (!isClient) {
        return null;
    }

    return <VideoPlayer embedUrl={videoUrl} />;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <div className="flex flex-col h-screen">
            {children}
            <footer className="h-32 flex-shrink-0 border-t bg-background">
                <ClientOnlyVideoPlayer />
            </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
