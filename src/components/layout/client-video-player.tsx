
'use client';

import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { onGlobalVideoUrlChange } from '@/lib/storage';

const ClientVideoPlayer = () => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onGlobalVideoUrlChange((url) => {
            setVideoUrl(url);
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

    if (!videoId) {
        return <div className="h-full w-full bg-black flex items-center justify-center text-muted-foreground"><p>No video set by admin.</p></div>;
    }
    
    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            showinfo: 0,
            mute: 1,
            loop: 1,
            playlist: videoId, // Required for loop to work
        },
    };

    return (
         <div className="w-full h-full">
            <YouTube
                videoId={videoId}
                opts={opts}
                className="w-full h-full"
                iframeClassName="w-full h-full"
            />
        </div>
    );
};

export default ClientVideoPlayer;
