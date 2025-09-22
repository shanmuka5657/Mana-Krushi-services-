
'use client';

import { useState, useEffect, useRef } from 'react';
import YouTube, { type YouTubePlayer } from 'react-youtube';
import Image from 'next/image';
import { onGlobalVideoUrlChange, onGlobalVideoVisibilityChange } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, X, PlayCircle, ThumbsUp, Share2, EyeOff, Maximize, Minimize } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import placeholderImages from '@/lib/placeholder-images.json';

const ClientVideoPlayer = () => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isPlayerGloballyVisible, setIsPlayerGloballyVisible] = useState(true);
    const [isPlayerLocallyVisible, setIsPlayerLocallyVisible] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const playerRef = useRef<YouTubePlayer | null>(null);
    const { toast } = useToast();
    const [origin, setOrigin] = useState<string>('');
    const { defaultLogo } = placeholderImages;

    useEffect(() => {
        setOrigin(window.location.origin);

        const unsubUrl = onGlobalVideoUrlChange((url) => {
            setVideoUrl(url);
            if (url) {
                setIsPlayerLocallyVisible(true); // Show player when URL changes
            }
        });

        const unsubVisibility = onGlobalVideoVisibilityChange((isVisible) => {
            setIsPlayerGloballyVisible(isVisible);
        });

        return () => {
            unsubUrl();
            unsubVisibility();
        };
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
    
    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    }
    
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
            navigator.clipboard.writeText(videoUrl).then(() => {
                toast({ title: 'Link Copied!', description: 'Video link copied to clipboard.' });
            });
        }
    };

    const isPlayerVisible = isPlayerGloballyVisible && isPlayerLocallyVisible;

    if (!isPlayerVisible && !isFullScreen) {
        return (
            <div className="h-full w-full bg-black flex items-center justify-center text-muted-foreground p-2">
                {!isPlayerGloballyVisible ? (
                    <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        <span>Admin has disabled the video player.</span>
                    </div>
                ) : (
                    <Button variant="ghost" onClick={() => setIsPlayerLocallyVisible(true)}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Show Media
                    </Button>
                )}
            </div>
        );
    }
    
    if (!videoId) {
        return (
            <div className="h-full w-full bg-black flex items-center justify-center text-muted-foreground p-2 relative">
                <p>No video set by admin.</p>
                 <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-6 w-6" onClick={() => setIsPlayerLocallyVisible(false)}>
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
         <div className={cn(
            "w-full h-full relative group",
            isFullScreen && "fixed inset-0 z-[100] bg-black"
         )}>
            <YouTube
                videoId={videoId}
                opts={opts}
                className="w-full h-full"
                iframeClassName="w-full h-full"
                onReady={onPlayerReady}
            />
            <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/50 p-2 rounded-lg pointer-events-none">
                 <Image 
                    src={defaultLogo.url}
                    alt="Mana Krushi Services Logo"
                    width={24}
                    height={24}
                    className="rounded-full"
                    data-ai-hint={defaultLogo.hint}
                />
                <span className="text-white font-bold text-lg">Mana Krushi Services</span>
            </div>
             <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 p-1 rounded-lg">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={handleLike}>
                    <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={toggleFullScreen}>
                    {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={() => setIsPlayerLocallyVisible(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default ClientVideoPlayer;
