
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { getBookings, getCurrentUser } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { Loader2, Gamepad2, Calendar, Clock, User, Play } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

function GamesPageContent() {
    const router = useRouter();
    const [latestBooking, setLatestBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const handlePlayGame = () => {
        // For now, redirect to the entertainment page as a placeholder
        router.push('/entertainment');
    };

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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gamepad2 />
                        Ride & Play
                    </CardTitle>
                    <CardDescription>
                        While you wait for your ride, why not play a game?
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {latestBooking ? (
                        <Card className="bg-muted/50">
                            <CardHeader>
                                <CardTitle>Your Next Ride</CardTitle>
                                <CardDescription>This is your upcoming confirmed ride.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="font-bold text-lg text-primary">{latestBooking.destination}</div>
                                <div className="flex items-center text-sm text-muted-foreground gap-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{format(new Date(latestBooking.departureDate), 'PPP')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{format(new Date(latestBooking.departureDate), 'p')}</span>
                                    </div>
                                </div>
                                 <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <User className="h-4 w-4" />
                                    <span>Driver: {latestBooking.driverName}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handlePlayGame} className="w-full">
                                    <Play className="mr-2 h-4 w-4" />
                                    Play Now
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
