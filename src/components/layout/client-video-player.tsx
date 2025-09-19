
'use client';

import { useState, useEffect, useRef } from 'react';
import YouTube, { type YouTubePlayer } from 'react-youtube';
import { onGlobalVideoUrlChange, logVideoUnmute } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, X, PlayCircle, ThumbsUp, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ClientVideoPlayer = () => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isPlayerVisible, setIsPlayerVisible] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const playerRef = useRef<YouTubePlayer | null>(null);
    const { toast } = useToast();
    const [origin, setOrigin] = useState<string>('');

    useEffect(() => {
        // This ensures the origin is only set on the client side
        setOrigin(window.location.origin);

        const unsub = onGlobalVideoUrlChange((url) => {
            setVideoUrl(url);
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
                if (videoUrl) {
                    logVideoUnmute(videoUrl);
                }
                 toast({
                    title: "How to Unmute",
                    description: "Due to browser policies, you may need to click the video directly to enable audio.",
                });
            } else {
                playerRef.current.mute();
            }
            setIsMuted(!isMuted);
        }
    };
    
    const handleLike = () => {
        if(videoUrl) {
            window.open(videoUrl, '_blank');
        }
    }

    const handleShare = async () => {
        if (navigator.share && videoUrl) {
            try {
                await navigator.share({
                    title: 'Mana Krushi Services',
                    text: 'Check out this video!',
                    url: videoUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else if (videoUrl) {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(videoUrl).then(() => {
                toast({ title: 'Link Copied!', description: 'Video link copied to clipboard.' });
            });
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
            controls: 1,
            rel: 0,
            mute: 1, 
            loop: 1,
            playlist: videoId,
            origin: origin,
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
             <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/50 p-1 rounded-lg">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={handleLike}>
                    <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={() => setIsPlayerVisible(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default ClientVideoPlayer;
