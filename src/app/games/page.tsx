
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { getBookings, getCurrentUser } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { Loader2, Gamepad2, Calendar, Clock, User, Play, Phone, Info, Hash, Ghost, Shell, Timer, Share2 } from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const games = [
    { name: '2048', icon: <Hash className="h-10 w-10 text-orange-500" />, href: 'https://play2048.co/', color: 'bg-orange-50' },
    { name: 'Pac-Man', icon: <Ghost className="h-10 w-10 text-yellow-400" />, href: 'https://www.google.com/search?q=pacman', color: 'bg-yellow-50' },
    { name: 'Snake', icon: <Shell className="h-10 w-10 text-green-500" />, href: 'https://playsnake.org/', color: 'bg-green-50' },
];

function GameCard({ name, icon, href, color }: { name: string, icon: React.ReactNode, href: string, color: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
        >
            <Card className={`h-full flex flex-col items-center justify-center p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 ${color}`}>
                <div className="mb-4">
                    {icon}
                </div>
                <h3 className="font-semibold text-lg text-foreground">{name}</h3>
                 <Button variant="link" className="mt-2">Play Now</Button>
            </Card>
        </a>
    );
}

function GamesPageContent() {
    const router = useRouter();
    const { toast } = useToast();
    const [latestBooking, setLatestBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const fetchLatestBooking = async () => {
            const userEmail = getCurrentUser();
            if (!userEmail) {
                setIsLoading(false);
                return;
            }

            const allBookings = await getBookings();
            const userBookings = allBookings.filter(b => b.clientEmail === userEmail && b.status === 'Confirmed');
            
            const now = new Date();
            const upcomingBookings = userBookings
                .filter(b => new Date(b.departureDate) > now)
                .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());

            if (upcomingBookings.length > 0) {
                setLatestBooking(upcomingBookings[0]);
            }

            setIsLoading(false);
        };

        fetchLatestBooking();
    }, []);
    
    useEffect(() => {
        if (!latestBooking) return;

        const intervalId = setInterval(() => {
            const now = new Date();
            const departure = new Date(latestBooking.departureDate);
            const diff = differenceInSeconds(departure, now);

            if (diff <= 0) {
                setTimeLeft("Your ride is departing now!");
                clearInterval(intervalId);
                return;
            }

            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;

            setTimeLeft(
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(intervalId);
    }, [latestBooking]);

    const handleCallDriver = () => {
        if (latestBooking?.driverMobile) {
            window.location.href = `tel:${latestBooking.driverMobile}`;
        }
    };
    
    const handleShareLocation = () => {
        if (!navigator.geolocation) {
            toast({ title: "Geolocation is not supported by your browser.", variant: 'destructive' });
            return;
        }

        const success = async (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            const shareText = `Hello, this is ${latestBooking?.client}. I am sharing my current location for our ride.`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'My Ride Location',
                        text: shareText,
                        url: mapsUrl
                    });
                    toast({title: "Location shared successfully!"});
                } catch (error: any) {
                    // This error is expected if the user cancels the share.
                    if (error.name === 'AbortError' || error.message.includes('Share canceled')) {
                        console.log('Share action was cancelled by the user.');
                    } else {
                         console.error('Error sharing:', error);
                         toast({ title: "Could not share location", description: "The share action failed.", variant: "destructive" });
                    }
                }
            } else {
                 // Fallback for desktop browsers that don't support navigator.share
                const whatsappUrl = `https://wa.me/${latestBooking?.driverMobile}?text=${encodeURIComponent(shareText + " " + mapsUrl)}`;
                window.open(whatsappUrl, '_blank');
            }
        };

        const error = () => {
            toast({ title: "Unable to retrieve your location.", description: "Please ensure location services are enabled.", variant: 'destructive' });
        };
        
        toast({ title: "Getting your location..." });
        navigator.geolocation.getCurrentPosition(success, error);
    };
    
    const handleMoreInfo = () => {
        router.push('/bookings?role=passenger');
    }

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gamepad2 />
                            Ride & Play
                        </CardTitle>
                        <CardDescription>
                            While you wait for your ride, you can check details or contact your driver.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {latestBooking ? (
                            <Card className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle>Your Next Ride</CardTitle>
                                    {timeLeft && (
                                        <div className="flex items-center gap-2 text-lg font-mono text-primary pt-2">
                                            <Timer className="h-5 w-5" />
                                            <span>{timeLeft}</span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="font-semibold text-md text-primary">{latestBooking.destination}</div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{format(new Date(latestBooking.departureDate), 'dd MMM, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>{format(new Date(latestBooking.departureDate), 'p')}</span>
                                        </div>
                                         <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>{latestBooking.driverName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <span>{latestBooking.driverMobile}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="grid grid-cols-3 gap-2">
                                    <Button onClick={handleCallDriver} className="w-full" size="icon" aria-label="Call Driver">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={handleShareLocation} className="w-full" variant="outline" size="icon" aria-label="Share Location">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={handleMoreInfo} className="w-full" variant="ghost" size="icon" aria-label="More Info">
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ) : (
                            <div className="text-center py-10">
                                <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">No Upcoming Rides</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Book a ride to unlock games and entertainment.
                                </p>
                                <Button className="mt-4" onClick={() => router.push('/dashboard?role=passenger')}>
                                    Find a Ride
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Play a Game</CardTitle>
                        <CardDescription>Have some fun while you wait!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {games.map(game => (
                                <GameCard key={game.name} {...game} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


export default function GamesPage() {
    return (
        <Suspense>
            <GamesPageContent />
        </Suspense>
    )
}
