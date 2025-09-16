
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { getBookings, getCurrentUser, getCurrentUserName, getCurrentUserRole, saveBookings } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { Loader2, Gamepad2, Calendar, Clock, User, Play, Phone, Info, Hash, Ghost, Shell, Timer, Share2, MapPin, CheckCircle, Smartphone, IndianRupee, MessageSquare } from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import DriverRideCard from '@/components/dashboard/driver-ride-card';


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
    const [driverRide, setDriverRide] = useState<Booking | null>(null);
    const [passengerCount, setPassengerCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchLatestBooking = async () => {
            const role = getCurrentUserRole();
            setUserRole(role);
            const userEmail = getCurrentUser();

            if (!userEmail) {
                setIsLoading(false);
                return;
            }

            const allBookings = await getBookings(true); // Fetch all as we might be a driver
            const now = new Date();

            if (role === 'owner') {
                const driverBookings = allBookings.filter(b => 
                    b.driverEmail === userEmail && 
                    b.status === 'Confirmed' && 
                    new Date(b.departureDate) > now
                );
                driverBookings.sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
                
                if (driverBookings.length > 0) {
                    const nextDrive = driverBookings[0];
                    setDriverRide(nextDrive);

                    const passengersForRide = allBookings.filter(b => 
                        b.destination === nextDrive.destination &&
                        new Date(b.departureDate).getTime() === new Date(nextDrive.departureDate).getTime() &&
                        b.status === 'Confirmed'
                    );
                    setPassengerCount(passengersForRide.reduce((sum, b) => sum + (Number(b.travelers) || 1), 0));
                }

            } else { // Passenger
                const userBookings = allBookings.filter(b => b.clientEmail === userEmail && b.status === 'Confirmed');
                
                const upcomingBookings = userBookings
                    .filter(b => new Date(b.departureDate) > now)
                    .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());

                if (upcomingBookings.length > 0) {
                    setLatestBooking(upcomingBookings[0]);
                }
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
    
    const handleShareLocation = async () => {
        if (!navigator.geolocation || !latestBooking) {
            toast({ title: "Geolocation is not supported by your browser.", variant: 'destructive' });
            return;
        }

        const success = async (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;

            // Save location to booking
            const allBookings = await getBookings(true);
            const updatedBookings = allBookings.map(b => 
                b.id === latestBooking.id 
                ? { ...b, passengerLatitude: latitude, passengerLongitude: longitude } 
                : b
            );
            await saveBookings(updatedBookings);

            toast({ title: "Location Saved!", description: "Your location has been shared with the driver." });

            // Share via WhatsApp/Native Share
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            const shareText = `Hello, this is ${latestBooking?.client}. I am sharing my current location for our ride.`;

            try {
                if (navigator.share) {
                    await navigator.share({
                        title: 'My Ride Location',
                        text: shareText,
                        url: mapsUrl
                    });
                } else {
                     // Fallback for desktop browsers that don't support navigator.share
                    const whatsappUrl = `https://wa.me/${latestBooking?.driverMobile}?text=${encodeURIComponent(shareText + " " + mapsUrl)}`;
                    window.open(whatsappUrl, '_blank');
                }
            } catch (error: any) {
                // Check if the error is due to the user canceling the share dialog
                if (error.name === 'AbortError' || (error.message && error.message.includes('Share canceled'))) {
                    // Do nothing, user intentionally closed the dialog
                } else {
                    console.error('Error sharing:', error);
                    toast({ title: "Could not share location", description: "An unexpected error occurred during sharing.", variant: "destructive" });
                }
            }
        };

        const error = () => {
            toast({ title: "Unable to retrieve your location.", description: "Please ensure location services are enabled.", variant: 'destructive' });
        };
        
        toast({ title: "Getting your location..." });
        navigator.geolocation.getCurrentPosition(success, error);
    };

    const handleWhatsApp = () => {
        if (!latestBooking || !latestBooking.driverMobile) return;
        
        const bookingDate = new Date(latestBooking.departureDate);
        const formattedDate = format(bookingDate, 'dd MMM, yyyy');
        const formattedTime = format(bookingDate, 'p');

        const message = `
Hello ${latestBooking.driverName},

This message is regarding my upcoming ride booking.

*Booking Details:*
- *Passenger:* ${latestBooking.client}
- *Route:* ${latestBooking.destination}
- *Date:* ${formattedDate}
- *Time:* ${formattedTime}
- *Amount:* ₹${latestBooking.amount.toFixed(2)}

Looking forward to the trip.

Thank you,
${latestBooking.client}
        `.trim().replace(/^\s+/gm, '');
        
        const whatsappUrl = `https://wa.me/${latestBooking.driverMobile}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
    
    const handleMoreInfo = () => {
        router.push('/bookings?role=passenger');
    }

    const handleViewOnMap = () => {
        if (latestBooking?.driverLatitude && latestBooking?.driverLongitude) {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latestBooking.driverLatitude},${latestBooking.driverLongitude}`;
            window.open(mapsUrl, '_blank');
        }
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
                            While you wait, you can play a game or manage your upcoming trip.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {userRole === 'owner' && driverRide ? (
                             <DriverRideCard ride={driverRide} passengers={passengerCount} />
                        ) : userRole === 'passenger' && latestBooking ? (
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
                                <CardFooter className="grid grid-cols-5 gap-2">
                                    <Button onClick={handleCallDriver} className="w-full" size="icon" aria-label="Call Driver">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={handleWhatsApp} className="w-full bg-green-500 hover:bg-green-600" size="icon" aria-label="WhatsApp Driver">
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={handleShareLocation} className="w-full" variant="outline" size="icon" aria-label="Share Location">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                    {latestBooking.driverLatitude && latestBooking.driverLongitude && (
                                        <Button onClick={handleViewOnMap} className="w-full" variant="outline" size="icon" aria-label="View on Map">
                                            <MapPin className="h-4 w-4" />
                                        </Button>
                                    )}
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
                                    Book a ride to unlock more features.
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
