
"use client";

import * as React from 'react';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';
import { getVideoPlayerState, onVideoPlayerStateChange, saveVideoPlayerState, getCurrentUserRole } from '@/lib/storage';
import type { VideoPlayerState } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const getYouTubeVideoId = (url: string): string | null => {
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


export default function AdminVideoPlayer() {
    const { toast } = useToast();
    const [videoUrl, setVideoUrl] = React.useState('');
    const [currentVideoId, setCurrentVideoId] = React.useState<string | null>(null);
    const role = getCurrentUserRole();
    const isAdmin = role === 'admin';
    const playerRef = React.useRef<YouTubePlayer | null>(null);
    const syncIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        if (!isAdmin) return;

        const fetchInitialState = async () => {
            const state = await getVideoPlayerState();
            if (state?.videoId) {
                const videoId = getYouTubeVideoId(state.videoId);
                setVideoUrl(state.videoId);
                setCurrentVideoId(videoId);
            }
        };
        fetchInitialState();

        const unsubscribe = onVideoPlayerStateChange((state) => {
            if (state?.videoId) {
                const newVideoId = getYouTubeVideoId(state.videoId);
                if (newVideoId !== currentVideoId) {
                    setCurrentVideoId(newVideoId);
                }
            }
        });

        return () => {
            unsubscribe();
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [isAdmin, currentVideoId]);

    const onPlayerReady = (event: { target: YouTubePlayer }) => {
        playerRef.current = event.target;
    };
    
    const onPlayerStateChange = (event: { data: number }) => {
        if (!playerRef.current) return;
        const isPlaying = event.data === 1; // 1 means playing
        const timestamp = playerRef.current.getCurrentTime();
        
        saveVideoPlayerState({ isPlaying, timestamp });

        if (isPlaying) {
            if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
            // Sync time every 15 seconds while playing to reduce buffering
            syncIntervalRef.current = setInterval(() => {
                if(playerRef.current?.getPlayerState() === 1) { 
                    saveVideoPlayerState({ timestamp: playerRef.current.getCurrentTime() });
                }
            }, 15000); 
        } else {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        }
    };

    if (!isAdmin || !currentVideoId) {
        return null;
    }

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0">
             <YouTube
                videoId={currentVideoId}
                opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1 } }}
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
            />
        </div>
    );
}
