
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import * as React from 'react';
import { onVideoPlayerStateChange, getVideoPlayerState, incrementVisitorCount, getCurrentUserRole } from '@/lib/storage';
import type { VideoPlayerState } from '@/lib/types';
import YouTube from 'react-youtube';

const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
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
        if (match) videoId = match[1];
    }
    return videoId ? videoId.split('?')[0].split('&')[0] : null;
};


const SynchronizedVideoPlayer = () => {
    const [playerState, setPlayerState] = React.useState<VideoPlayerState | null>(null);
    const [isClient, setIsClient] = React.useState(false);
    const playerRef = React.useRef<any>(null);
    const role = getCurrentUserRole();
    const isAdmin = role === 'admin';

    React.useEffect(() => {
        setIsClient(true);
        const fetchInitialState = async () => {
            const initialState = await getVideoPlayerState();
            setPlayerState(initialState);
        };
        fetchInitialState();

        const unsubscribe = onVideoPlayerStateChange((newState) => {
            setPlayerState(newState);
        });

        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        const player = playerRef.current;
        if (!player || !playerState || isAdmin) return;

        // Sync playing state
        const currentPlayerState = player.getPlayerState();
        if (playerState.isPlaying && currentPlayerState !== 1) {
            player.playVideo();
        } else if (!playerState.isPlaying && currentPlayerState === 1) {
            player.pauseVideo();
        }

        // Sync timestamp
        const timeDifference = Math.abs(player.getCurrentTime() - playerState.timestamp);
        if (timeDifference > 2) { // Only seek if difference is more than 2 seconds
            player.seekTo(playerState.timestamp, true);
        }

    }, [playerState, isAdmin]);

    if (!isClient || !playerState?.videoId) {
        return null;
    }

    const videoId = getYouTubeVideoId(playerState.videoId);
    if (!videoId) return null;

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0,
            showinfo: 0,
            rel: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            loop: 1,
            playlist: videoId, // Required for loop to work
            mute: 1, // Must be muted to autoplay
        },
    };

    return (
        <div className="w-full h-full pointer-events-none">
            <YouTube
                videoId={videoId}
                opts={opts}
                onReady={(event) => { playerRef.current = event.target; }}
                className="w-full h-full"
            />
        </div>
    );
};


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
                <SynchronizedVideoPlayer />
            </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
