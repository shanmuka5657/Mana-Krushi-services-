
"use client";

import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Suspense } from 'react';
import { Film, Search, Loader2, PlayCircle, Tv, Clapperboard, Youtube, PauseCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { findMovie } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { MovieSite, VideoPlayerState } from '@/lib/types';
import { getCurrentUserRole, saveVideoPlayerState, getVideoPlayerState } from '@/lib/storage';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';

const freeSites = [
    { name: 'YouTube', icon: <Clapperboard className="h-10 w-10 text-red-600" />, href: 'https://www.youtube.com', color: 'bg-red-50' },
    { name: 'MX Player', icon: <PlayCircle className="h-10 w-10 text-blue-500" />, href: 'https://www.mxplayer.in/', color: 'bg-blue-50' },
    { name: 'Plex', icon: <Tv className="h-10 w-10 text-green-500" />, href: 'https://www.plex.tv/watch-free', color: 'bg-green-50' },
    { name: 'Hotstar', icon: <Tv className="h-10 w-10 text-blue-800" />, href: 'https://www.hotstar.com/in/explore', color: 'bg-blue-50' },
    { name: 'Zee5', icon: <Tv className="h-10 w-10 text-purple-600" />, href: 'https://www.zee5.com/watch/movies/free-to-watch', color: 'bg-purple-50' },
    { name: 'SonyLIV', icon: <Tv className="h-10 w-10 text-gray-700" />, href: 'https://www.sonyliv.com/', color: 'bg-gray-100' },
];

function SiteCard({ site }: { site: { name: string, icon: React.ReactNode, href: string, color: string } }) {
    return (
        <a
            key={site.name}
            href={site.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
        >
            <Card className={`h-full flex flex-col items-center justify-center p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 ${site.color}`}>
                <div className="mb-4">
                    {site.icon}
                </div>
                <h3 className="font-semibold text-lg text-foreground">{site.name}</h3>
            </Card>
        </a>
    );
}

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

function EntertainmentPageContent() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<MovieSite[]>([]);
    
    const [videoUrl, setVideoUrl] = useState('');
    const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const playerRef = useRef<YouTubePlayer | null>(null);
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const role = getCurrentUserRole();
        const isAdminUser = role === 'admin';
        setIsAdmin(isAdminUser);

        if (isAdminUser) {
            const fetchInitialState = async () => {
                const state = await getVideoPlayerState();
                if (state?.videoId) {
                    setVideoUrl(state.videoId);
                    setCurrentVideoId(getYouTubeVideoId(state.videoId));
                }
            };
            fetchInitialState();
        }

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        }
    }, []);

    const handleSetVideo = async () => {
        try {
            const videoId = getYouTubeVideoId(videoUrl);
            if (!videoId) {
                throw new Error("Please use a valid YouTube URL.");
            }
            setCurrentVideoId(videoId);
            await saveVideoPlayerState({ videoId: videoUrl, isPlaying: true, timestamp: 0 });
            toast({
                title: 'Video Set!',
                description: 'The background video has been updated for all users.',
            });
        } catch (error: any) {
            toast({
                title: 'Invalid URL',
                description: error.message || 'Please enter a valid YouTube URL.',
                variant: 'destructive',
            });
        }
    };
    
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
            // Sync time every 5 seconds while playing
            syncIntervalRef.current = setInterval(() => {
                if(playerRef.current?.getPlayerState() === 1) { 
                    saveVideoPlayerState({ timestamp: playerRef.current.getCurrentTime() });
                }
            }, 5000); 
        } else {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        }
    };
    
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast({ title: 'Please enter a movie name.', variant: 'destructive' });
            return;
        }
        setIsSearching(true);
        setSearchResults([]);
        const result = await findMovie({ movieName: searchQuery });
        setIsSearching(false);

        if (result.error) {
            toast({ title: 'Something went wrong', description: result.error, variant: 'destructive' });
        } else if (result.sites && result.sites.length > 0) {
            setSearchResults(result.sites);
        } else {
            toast({ title: 'No free streams found', description: `We couldn't find any free (and legal) streams for "${searchQuery}".` });
        }
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                {isAdmin && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Master Video Control</CardTitle>
                            <CardDescription>
                                Set a YouTube video and control its playback for all users in real-time. Use the player below to play, pause, and seek.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4">
                                <Input 
                                    placeholder="Enter any YouTube video URL"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                />
                                <Button onClick={handleSetVideo}>
                                    <PlayCircle className="h-4 w-4" />
                                    <span className="ml-2 hidden sm:inline">Set Video</span>
                                </Button>
                            </div>
                            {currentVideoId && (
                                <div className="aspect-video">
                                     <YouTube
                                        videoId={currentVideoId}
                                        opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1 } }}
                                        onReady={onPlayerReady}
                                        onStateChange={onPlayerStateChange}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                 <Card>
                    <CardHeader>
                        <CardTitle>Find a Movie</CardTitle>
                        <CardDescription>Search for a movie to find where to watch it for free.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                             <Input 
                                placeholder="Enter movie name (e.g., 'The Matrix')"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                             />
                             <Button onClick={handleSearch} disabled={isSearching}>
                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                <span className="ml-2 hidden sm:inline">Search</span>
                             </Button>
                        </div>
                    </CardContent>
                </Card>

                {isSearching && (
                    <div className="text-center p-10">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="mt-4 text-muted-foreground">Searching for free streams...</p>
                    </div>
                )}

                {searchResults.length > 0 && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Search Results for "{searchQuery}"</CardTitle>
                            <CardDescription>Found the following free (and legal) streaming options.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {searchResults.map((site) => (
                                    <a
                                        key={site.name}
                                        href={site.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group"
                                    >
                                        <Card className="h-full flex flex-col items-center justify-center p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 bg-background">
                                            <div className="mb-4">
                                                <Tv className="h-10 w-10 text-primary" />
                                            </div>
                                            <h3 className="font-semibold text-lg text-foreground">{site.name}</h3>
                                        </Card>
                                    </a>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}


                <Card>
                    <CardHeader>
                        <CardTitle>Free Movie Platforms</CardTitle>
                        <CardDescription>Explore these platforms for free movies and TV shows available in India.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {freeSites.map((site) => (
                                <SiteCard key={site.name} site={site} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default function EntertainmentPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <EntertainmentPageContent />
        </Suspense>
    );
}
