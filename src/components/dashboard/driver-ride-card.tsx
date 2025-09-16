
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Share2, Users, Info, MapPin, Route, Loader2, Calendar, Clock } from 'lucide-react';
import type { Booking } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getBookings, saveBookings } from '@/lib/storage';
import { format, differenceInSeconds } from 'date-fns';
import { useRouter } from 'next/navigation';

interface DriverRideCardProps {
    ride: Booking;
    passengers: number;
}

export default function DriverRideCard({ ride, passengers }: DriverRideCardProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSharing, setIsSharing] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date();
            const departure = new Date(ride.departureDate);
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
    }, [ride]);
    
    const handleShareLocation = () => {
        if (!navigator.geolocation) {
         toast({ title: "Geolocation is not supported by your browser.", variant: 'destructive' });
         return;
       }
   
       const success = async (position: GeolocationPosition) => {
           const { latitude, longitude } = position.coords;
           const allBookings = await getBookings(true);
           const updatedBookings = allBookings.map(b => 
               b.id === ride.id ? { ...b, driverLatitude: latitude, driverLongitude: longitude } : b
           );
           await saveBookings(updatedBookings);
           
           toast({ title: 'Location Shared!', description: 'Your current location has been shared with the passenger.' });
           setIsSharing(false);
       };
   
       const error = () => {
           toast({ title: "Unable to retrieve your location.", description: "Please ensure location services are enabled.", variant: 'destructive' });
           setIsSharing(false);
       };
       
       setIsSharing(true);
       toast({ title: "Getting your location..." });
       navigator.geolocation.getCurrentPosition(success, error);
    };

    const handleMoreInfo = () => {
        router.push('/my-routes?role=owner');
    }

    return (
        <Card className="bg-muted/50">
            <CardHeader>
                <CardTitle>Your Next Drive</CardTitle>
                {timeLeft && (
                    <div className="flex items-center gap-2 text-lg font-mono text-primary pt-2">
                        <Timer className="h-5 w-5" />
                        <span>{timeLeft}</span>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="font-semibold text-md text-primary">{ride.destination}</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(ride.departureDate), 'dd MMM, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(ride.departureDate), 'p')}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{passengers} passenger(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Route className="h-4 w-4" />
                        <span>{ride.vehicleNumber}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
                 <Button onClick={handleShareLocation} className="w-full" variant="outline" disabled={isSharing}>
                    {isSharing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sharing...
                        </>
                    ) : (
                         <>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Location
                        </>
                    )}
                </Button>
                <Button onClick={handleMoreInfo} className="w-full" variant="secondary">
                    <Info className="mr-2 h-4 w-4" />
                    View Details
                </Button>
            </CardFooter>
        </Card>
    );
}
