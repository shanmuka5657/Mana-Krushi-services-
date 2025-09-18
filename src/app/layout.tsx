
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import * as React from 'react';
import { onGlobalVideoUrlChange, getGlobalVideoUrl } from '@/lib/storage';
import Script from 'next/script';


const VideoPlayer = React.memo(function VideoPlayer({ embedUrl }: { embedUrl: string }) {
  if (!embedUrl) return null;

  const getYouTubeVideoId = (url: string) => {
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.pathname.includes('/embed/')) {
                videoId = urlObj.pathname.split('/embed/')[1];
            } else if (urlObj.searchParams.has('v')) {
                videoId = urlObj.searchParams.get('v');
            }
        } else if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.substring(1);
        }
    } catch(e) {
        // Fallback for simple regex if URL parsing fails
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
        const match = url.match(regex);
        if (match) {
            videoId = match[1];
        }
    }
    // Remove any extra query params from videoId
    if (videoId) {
      return videoId.split('?')[0].split('&')[0];
    }
    return null;
  };

  const videoId = getYouTubeVideoId(embedUrl);

  if (!videoId) {
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
    const [videoUrl, setVideoUrl] = React.useState('https://www.youtube.com/embed/jfKfPfyJRdk');
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
         <Script id="ad-script-1" strategy="afterInteractive">
          {`(function(d,z,s){s.src='https://'+d+'/400/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('groleegni.net',9892027,document.createElement('script'))`}
        </Script>
        <Script id="ad-script-2" strategy="afterInteractive">
          {`(function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('groleegni.net',9892028,document.createElement('script'))`}
        </Script>
        <Script id="ad-script-3" strategy="afterInteractive">
            {`(function(s){s.dataset.zone='9892027',s.src='https://groleegni.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
        </Script>
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
