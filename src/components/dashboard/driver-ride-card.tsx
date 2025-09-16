
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Share2, Users, Info, Route, Loader2, Calendar, Clock, Phone, MessageSquare, CheckCircle } from 'lucide-react';
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
    const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

    useEffect(() => {
        const fetchRideDetails = async () => {
            const [allBookings, profiles] = await Promise.all([
                getBookings(true),
                getAllProfiles()
            ]);
            setAllProfiles(profiles);

            const relatedPassengers = allBookings.filter(b => 
                b.destination === ride.destination &&
                new Date(b.departureDate).getTime() === new Date(ride.departureDate).getTime() &&
                b.status === 'Confirmed'
            );
            setPassengersForRide(relatedPassengers);
        }
        fetchRideDetails();
    }, [ride]);

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

           // Update location for all bookings on this specific ride
            const updatedBookings = allBookings.map(b => {
                const isSameRide = b.destination === ride.destination &&
                                new Date(b.departureDate).getTime() === new Date(ride.departureDate).getTime();
                
                return isSameRide ? { ...b, driverLatitude: latitude, driverLongitude: longitude } : b;
            });
           
           await saveBookings(updatedBookings);
           
           toast({ title: 'Location Shared!', description: 'Your current location has been shared with all passengers on this ride.' });
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

Looking forward to having you on board.

Thank you,
${booking.driverName}
        `.trim();
        
        const whatsappUrl = `https://wa.me/${booking.mobile}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
    
    const getProfileForUser = (email?: string): Profile | undefined => {
        if (!email) return undefined;
        return allProfiles.find(p => p.email === email);
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
                 <Button onClick={() => setIsContactDialogOpen(true)} className="w-full" variant="outline">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Passengers
                 </Button>
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
                <Button onClick={handleMoreInfo} className="w-full col-span-2" variant="secondary">
                    <Info className="mr-2 h-4 w-4" />
                    View Details
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
                                    <AvatarImage src={profile?.selfieDataUrl || `https://ui-avatars.com/api/?name=${passenger.client.replace(' ', '+')}&background=random`} />
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
                            </div>
                        </div>
                    )})}
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
