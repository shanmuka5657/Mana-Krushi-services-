
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import * as React from 'react';
import { onGlobalVideoUrlChange, getGlobalVideoUrl, incrementVisitorCount } from '@/lib/storage';
import Script from 'next/script';


const VideoPlayer = React.memo(function VideoPlayer({ embedUrl }: { embedUrl: string }) {
  if (!embedUrl) return null;

  const getYouTubeVideoId = (url: string) => {
    let videoId = null;
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      if (hostname.includes('youtube.com')) {
        if (urlObj.pathname.includes('/embed/')) {
          videoId = urlObj.pathname.split('/embed/')[1];
        } else if (urlObj.pathname.includes('/watch')) {
          videoId = urlObj.searchParams.get('v');
        } else if (urlObj.pathname.includes('/live/')) {
          videoId = urlObj.pathname.split('/live/')[1];
        }
      } else if (hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.substring(1);
      }
    } catch (e) {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
      const match = url.match(regex);
      if (match) {
        videoId = match[1];
      }
    }
    
    if (videoId) {
      return videoId.split('?')[0].split('&')[0];
    }
    return null;
  };

  const videoId = getYouTubeVideoId(embedUrl);

  if (!videoId) {
    console.error("Could not extract YouTube video ID from URL:", embedUrl);
    return null;
  }

  const playerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;

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
    const [videoUrl, setVideoUrl] = React.useState('');
    const [isClient, setIsClient] = React.useState(false);
    
    React.useEffect(() => {
        setIsClient(true);
        
        const setInitialUrl = async () => {
            const url = await getGlobalVideoUrl();
            if (url) {
                setVideoUrl(url);
            }
        }
        setInitialUrl();

        const unsubscribe = onGlobalVideoUrlChange((newUrl: string) => {
            if (newUrl && newUrl !== videoUrl) {
                setVideoUrl(newUrl);
            }
        });

        return () => unsubscribe();
    }, []);

    if (!isClient) {
        return null; // Don't render on the server
    }

    return <VideoPlayer embedUrl={videoUrl || 'https://www.youtube.com/watch?v=jfKfPfyJRdk'} />;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  React.useEffect(() => {
    const trackVisitor = async () => {
        // Use sessionStorage to only count the visitor once per session
        if (!sessionStorage.getItem('visitor_tracked')) {
            await incrementVisitorCount();
            sessionStorage.setItem('visitor_tracked', 'true');
        }
    };
    trackVisitor();
  }, []);

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
