
'use client';

import { useState, useEffect, useRef } from 'react';
import YouTube, { type YouTubePlayer } from 'react-youtube';
import { onGlobalVideoUrlChange } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, X, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ClientVideoPlayer = () => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isPlayerVisible, setIsPlayerVisible] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const playerRef = useRef<YouTubePlayer | null>(null);

    useEffect(() => {
        const unsub = onGlobalVideoUrlChange((url) => {
            setVideoUrl(url);
            // If a new URL is set, make the player visible and muted by default
            if (url) {
                setIsPlayerVisible(true);
                setIsMuted(true);
            }
        });

        return () => unsub();
    }, []);

    const extractVideoId = (url: string | null): string | null => {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                return urlObj.pathname.slice(1);
            }
            if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
                return urlObj.searchParams.get('v');
            }
        } catch (error) {
            console.error('Invalid URL for YouTube video:', url);
        }
        return null;
    };
    
    const videoId = extractVideoId(videoUrl);
    
    const onPlayerReady = (event: { target: YouTubePlayer }) => {
        playerRef.current = event.target;
        if (isMuted) {
            playerRef.current.mute();
        } else {
            playerRef.current.unMute();
        }
    };

    const toggleMute = () => {
        if (playerRef.current) {
            if (isMuted) {
                playerRef.current.unMute();
            } else {
                playerRef.current.mute();
            }
            setIsMuted(!isMuted);
        }
    };

    if (!isPlayerVisible) {
        return (
            <div className="h-full w-full bg-black flex items-center justify-center text-muted-foreground p-2">
                <Button variant="ghost" onClick={() => setIsPlayerVisible(true)}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Open Media
                </Button>
            </div>
        );
    }
    
    if (!videoId) {
        return (
            <div className="h-full w-full bg-black flex items-center justify-center text-muted-foreground p-2 relative">
                <p>No video set by admin.</p>
                 <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-6 w-6" onClick={() => setIsPlayerVisible(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }
    
    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            showinfo: 0,
            mute: 1, // Let our state control mute after player is ready
            loop: 1,
            playlist: videoId, // Required for loop to work
        },
    };

    return (
         <div className="w-full h-full relative group">
            <YouTube
                videoId={videoId}
                opts={opts}
                className="w-full h-full"
                iframeClassName="w-full h-full"
                onReady={onPlayerReady}
            />
            <div className="absolute top-2 right-2 flex gap-2 transition-opacity">
                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                 <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => setIsPlayerVisible(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default ClientVideoPlayer;
