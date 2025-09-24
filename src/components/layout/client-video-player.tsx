
'use client';

import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';
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
    const [isPlayerLocallyVisible, setIsPlayerLocallyVisible] = useState(false); // Default to false
    const [isMuted, setIsMuted] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const playerRef = useRef<ReactPlayer | null>(null);
    const { toast } = useToast();
    const { defaultLogo } = placeholderImages;

    useEffect(() => {
        const unsubUrl = onGlobalVideoUrlChange((url) => {
            setVideoUrl(url);
        });

        const unsubVisibility = onGlobalVideoVisibilityChange((isVisible) => {
            setIsPlayerGloballyVisible(isVisible);
        });

        return () => {
            unsubUrl();
            unsubVisibility();
        };
    }, []);

    const getEmbedUrl = (url: string | null): string | null => {
        if (!url) return null;

        // YouTube
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${youtubeMatch[1]}&controls=1&rel=0`;
        }
        
        // Google Drive
        const driveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
        const driveMatch = url.match(driveRegex);
        if (driveMatch) {
            return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
        }

        // Return original URL if it's a direct video link or another supported format by ReactPlayer
        return url;
    }
    
    const finalVideoUrl = getEmbedUrl(videoUrl);

    const toggleMute = () => {
        setIsMuted(!isMuted);
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
    
    if (!finalVideoUrl) {
        return (
            <div className="h-full w-full bg-black flex items-center justify-center text-muted-foreground p-2 relative">
                <p>No video set by admin.</p>
                 <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-6 w-6" onClick={() => setIsPlayerLocallyVisible(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
         <div className={cn(
            "w-full h-full relative group bg-black",
            isFullScreen && "fixed inset-0 z-[100]"
         )}>
            <ReactPlayer
                ref={playerRef}
                url={finalVideoUrl}
                playing={true}
                loop={true}
                muted={isMuted}
                controls={true}
                width="100%"
                height="100%"
                className="react-player"
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
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={() => { setIsPlayerLocallyVisible(false); setIsFullScreen(false); }}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default ClientVideoPlayer;
