
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Share2, Users, Info, Route, Loader2, Calendar, Clock, Phone, MessageSquare, CheckCircle, Car, MapPin } from 'lucide-react';
import type { Booking, Profile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getBookings, saveBookings, getAllProfiles } from '@/lib/storage';
import { format, differenceInSeconds } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface DriverRideCardProps {
    ride: Booking;
    passengers: number;
}

export default function DriverRideCard({ ride, passengers }: DriverRideCardProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSharing, setIsSharing] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
    const [passengersForRide, setPassengersForRide] = useState<Booking[]>([]);
    const [passengerProfiles, setPassengerProfiles] = useState<Profile[]>([]);
    const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        const fetchRideDetails = async () => {
            const rideDate = format(new Date(ride.departureDate), 'yyyy-MM-dd');
            const rideTime = format(new Date(ride.departureDate), 'HH:mm');

            // OPTIMIZED: Fetch only bookings relevant to this ride
            const relatedPassengers = await getBookings(true, {
                destination: ride.destination,
                date: rideDate,
                time: rideTime
            });

            const confirmedPassengers = relatedPassengers.filter(b => b.status === 'Confirmed');
            setPassengersForRide(confirmedPassengers);

            if (confirmedPassengers.length > 0) {
                 // OPTIMIZED: Fetch only the profiles for the passengers on this ride.
                const passengerEmails = confirmedPassengers.map(p => p.clientEmail).filter((email): email is string => !!email);
                const profiles = await getAllProfiles(); // Still need all for now, but will filter
                const profilesForRide = profiles.filter(p => passengerEmails.includes(p.email));
                setPassengerProfiles(profilesForRide);
            }
        }
        fetchRideDetails();
         return () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }
        }
    }, [ride]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date();
            const departure = new Date(ride.departureDate);
            const diff = differenceInSeconds(departure, now);

            // Stop sharing 1 hour after departure
            if (diff < -3600) {
                setTimeLeft("Ride complete.");
                clearInterval(intervalId);
                if (locationIntervalRef.current) {
                    clearInterval(locationIntervalRef.current);
                    locationIntervalRef.current = null; // Clear ref after stopping
                }
                return;
            }

            if (diff <= 0) {
                setTimeLeft("Your ride is on the way!");
            } else {
                const hours = Math.floor(diff / 3600);
                const minutes = Math.floor((diff % 3600) / 60);
                const seconds = diff % 60;

                setTimeLeft(
                    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                );
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [ride]);
    
     const handleShareLocation = (isFirstShare: boolean = false) => {
        if (!navigator.geolocation) {
         if(isFirstShare) toast({ title: "Geolocation is not supported by your browser.", variant: 'destructive' });
         return;
       }
   
       const success = async (position: GeolocationPosition) => {
           const { latitude, longitude } = position.coords;
           const allBookings = await getBookings(true);

           // Update location for all bookings on this specific ride
            const updatedBookings = allBookings.map(b => {
                const isSameRide = b.destination === ride.destination &&
                                new Date(b.departureDate).getTime() === new Date(ride.departureDate).getTime();
                
                return isSameRide ? { ...b, driverLatitude: latitude, driverLongitude: longitude } : b;
            });
           
           await saveBookings(updatedBookings);
           
           if(isFirstShare) toast({ title: 'Location Sharing Active!', description: 'Your current location will be shared with passengers periodically.' });
           setIsSharing(false);
       };
   
       const error = () => {
           if(isFirstShare) toast({ title: "Unable to retrieve your location.", description: "Please ensure location services are enabled.", variant: 'destructive' });
           setIsSharing(false);
       };
       
       if(isFirstShare) {
           setIsSharing(true);
           toast({ title: "Sharing your location..." });
       }
       navigator.geolocation.getCurrentPosition(success, error);
    };

    useEffect(() => {
        // Share location immediately and then every minute
        handleShareLocation(true);
        locationIntervalRef.current = setInterval(() => handleShareLocation(false), 60000); // 60 seconds

        return () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }
        };
    }, [ride.id]);

    const handleMoreInfo = () => {
        router.push('/my-routes?role=owner');
    }
    
    const handleWhatsAppToPassenger = (booking: Booking) => {
        if (!booking.mobile) return;

        const bookingDate = new Date(booking.departureDate);
        const formattedDate = format(bookingDate, 'dd MMM, yyyy');
        const formattedTime = format(bookingDate, 'p');

        const message = `
Hello ${booking.client},

This is ${booking.driverName} from Mana Krushi Services, confirming your ride.

*Booking Details:*
- *Route:* ${booking.destination}
- *Date:* ${formattedDate}
- *Time:* ${formattedTime}
- *Amount:* ₹${booking.amount.toFixed(2)}

Looking forward to having you on board.

Thank you,
${booking.driverName}
        `.trim();
        
        const whatsappUrl = `https://wa.me/91${booking.mobile}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
    
    const getProfileForUser = (email?: string): Profile | undefined => {
        if (!email) return undefined;
        return passengerProfiles.find(p => p.email === email);
    }

    const handleViewOnMap = (booking: Booking) => {
        if (booking.passengerLatitude && booking.passengerLongitude) {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${booking.passengerLatitude},${booking.passengerLongitude}`;
            window.open(mapsUrl, '_blank');
        }
    }


    return (
        <>
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
            <CardContent className="space-y-4">
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
                        <Car className="h-4 w-4" />
                        <span>{ride.vehicleNumber}</span>
                    </div>
                </div>
                 {passengersForRide.length > 0 && (
                    <div className="pt-2">
                        <Label className="text-xs text-muted-foreground">Passengers on this ride:</Label>
                        <div className="flex items-center space-x-2 mt-1">
                            <div className="flex -space-x-2 overflow-hidden">
                                {passengersForRide.slice(0, 5).map(passenger => {
                                    const profile = getProfileForUser(passenger.clientEmail);
                                    return (
                                        <Avatar key={passenger.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                            <AvatarImage src={profile?.selfieDataUrl} />
                                            <AvatarFallback>{passenger.client.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    );
                                })}
                            </div>
                            {passengersForRide.length > 5 && (
                                <span className="text-xs font-medium text-muted-foreground">
                                +{passengersForRide.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2 w-full">
                     <Button onClick={() => setIsContactDialogOpen(true)} className="w-full" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Contact Passengers
                    </Button>
                    <Button onClick={() => handleShareLocation(true)} className="w-full" variant="outline" disabled={isSharing}>
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
                </div>
                <Button onClick={handleMoreInfo} className="w-full" variant="secondary">
                    <Info className="mr-2 h-4 w-4" />
                    View Ride Details
                </Button>
            </CardFooter>
        </Card>
        
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Contact Passengers</DialogTitle>
                    <DialogDescription>
                        Call or message passengers for your ride to {ride.destination}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {passengersForRide.map(passenger => {
                        const profile = getProfileForUser(passenger.clientEmail);
                        return (
                        <div key={passenger.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={profile?.selfieDataUrl} />
                                    <AvatarFallback>{passenger.client.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{passenger.client}</p>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {passenger.travelers} seat(s)
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a href={`tel:${passenger.mobile}`}>
                                     <Button size="icon" variant="outline">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                </a>
                                <Button size="icon" variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100" onClick={() => handleWhatsAppToPassenger(passenger)}>
                                    <MessageSquare className="h-4 w-4" />
                                </Button>
                                {passenger.passengerLatitude && passenger.passengerLongitude && (
                                    <Button size="icon" variant="outline" onClick={() => handleViewOnMap(passenger)}>
                                        <MapPin className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )})}
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
