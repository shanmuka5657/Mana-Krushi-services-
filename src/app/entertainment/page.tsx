
"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Suspense } from 'react';
import { Youtube, Facebook, Instagram, MessageSquare, UtensilsCrossed, Film, Clapperboard, Tv, Search, Loader2, PlayCircle, AppWindow, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { findMovie } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { MovieSite } from '@/lib/types';
import Script from 'next/script';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const freeSites = [
    { name: 'YouTube', icon: <Clapperboard className="h-10 w-10 text-red-600" />, href: 'https://www.youtube.com/embed/videoseries?list=PLHPTxTxtC0ibkGbuW0-u7P5qrE_tE-i-G', color: 'bg-red-50' },
    { name: 'MX Player', icon: <PlayCircle className="h-10 w-10 text-blue-500" />, href: 'https://www.mxplayer.in/', color: 'bg-blue-50' },
    { name: 'Plex', icon: <Tv className="h-10 w-10 text-green-500" />, href: 'https://www.plex.tv/watch-free', color: 'bg-green-50' },
    { name: 'Hotstar', icon: <Tv className="h-10 w-10 text-blue-800" />, href: 'https://www.hotstar.com/in/explore', color: 'bg-blue-50' },
    { name: 'Zee5', icon: <Tv className="h-10 w-10 text-purple-600" />, href: 'https://www.zee5.com/watch/movies/free-to-watch', color: 'bg-purple-50' },
    { name: 'SonyLIV', icon: <Tv className="h-10 w-10 text-gray-700" />, href: 'https://www.sonyliv.com/', color: 'bg-gray-100' },
];

function SiteCard({ site }: { site: { name: string, icon: React.ReactNode, href: string, color: string } }) {
    if (site.name === 'YouTube') {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Card className={`h-full flex flex-col items-center justify-center p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer ${site.color}`}>
                        <div className="mb-4">
                            {site.icon}
                        </div>
                        <h3 className="font-semibold text-lg text-foreground">{site.name}</h3>
                    </Card>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-4xl h-[80vh] flex flex-col p-2">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle>YouTube Movies</DialogTitle>
                        <DialogDescription>Watch free movies directly from YouTube.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow rounded-md overflow-hidden">
                        <iframe
                            src={site.href}
                            title="YouTube video player"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

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

function EntertainmentPageContent() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<MovieSite[]>([]);

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
