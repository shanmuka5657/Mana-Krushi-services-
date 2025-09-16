
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { getBookings, getCurrentUser } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { Loader2, Gamepad2, Calendar, Clock, User, Play, Phone, Info, Hash, Ghost, Shell, Timer } from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const games = [
    { name: '2048', icon: <Hash className="h-10 w-10 text-orange-500" />, href: 'https://play2048.co/', color: 'bg-orange-50' },
    { name: 'Pac-Man', icon: <Ghost className="h-10 w-10 text-yellow-400" />, href: 'https://www.google.com/search?q=pacman', color: 'bg-yellow-50' },
    { name: 'Snake', icon: <Shell className="h-10 w-10 text-green-500" />, href: 'https://playsnake.org/', color: 'bg-green-50' },
];

function WhatsAppIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
    )
}


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
        if (!latestBooking?.driverMobile) {
            toast({ title: "Driver contact not available.", variant: 'destructive' });
            return;
        }

        if (!navigator.geolocation) {
            toast({ title: "Geolocation is not supported by your browser.", variant: 'destructive' });
            return;
        }

        const success = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            const message = `Hello, this is ${latestBooking.client}. I am sharing my current location for our ride: ${mapsUrl}`;
            
            // Format number for international use (assuming Indian numbers)
            const whatsappNumber = `91${latestBooking.driverMobile}`;
            
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            
            window.open(whatsappUrl, '_blank');
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
                                <CardFooter className="grid grid-cols-2 gap-2">
                                    <Button onClick={handleCallDriver} className="w-full">
                                        <Phone className="mr-2 h-4 w-4" />
                                        Call Driver
                                    </Button>
                                     <Button onClick={handleShareLocation} className="w-full" variant="outline">
                                        <WhatsAppIcon />
                                        <span className="ml-2">Share Location</span>
                                    </Button>
                                     <Button onClick={handleMoreInfo} className="w-full col-span-2" variant="ghost">
                                        <Info className="mr-2 h-4 w-4" />
                                        More Info
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
