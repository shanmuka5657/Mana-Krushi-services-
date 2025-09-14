
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBookings, getAllProfiles } from '@/lib/storage';
import type { Booking, Profile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Phone, Car, Shield, Share2, CheckCircle, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function TrackRidePage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [passengerProfile, setPassengerProfile] = useState<Profile | null>(null);
    const [driverProfile, setDriverProfile] = useState<Profile | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [mapUrl, setMapUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookingAndProfiles = async () => {
            const bookingId = typeof params.id === 'string' ? params.id : '';
            const allBookings = await getBookings(true);
            const foundBooking = allBookings.find(b => b.id === bookingId);

            if (foundBooking) {
                setBooking(foundBooking);
                const allProfiles = await getAllProfiles();
                if(foundBooking.clientEmail) {
                    setPassengerProfile(allProfiles.find(p => p.email === foundBooking.clientEmail) || null);
                }
                if(foundBooking.driverEmail) {
                    setDriverProfile(allProfiles.find(p => p.email === foundBooking.driverEmail) || null);
                }
                
                // Construct Google Maps Embed URL
                const [from, to] = foundBooking.destination.split(' to ');
                const embedMapUrl = `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`;
                setMapUrl(embedMapUrl);

            }
            setIsLoaded(true);
        };
        fetchBookingAndProfiles();
    }, [params.id]);

    const handleShare = async () => {
        if (!booking) return;

        const shareData = {
            title: `Track my ride: ${booking.destination}`,
            text: `I'm on my way to ${booking.destination.split(' to ')[1]} with ${booking.driverName}. You can see my ride status here:`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast({ title: 'Ride details shared successfully!' });
            } else {
                // Fallback for browsers that don't support navigator.share
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                toast({ title: 'Ride link copied to clipboard!' });
            }
        } catch (error) {
            console.error('Error sharing:', error);
            toast({
                title: 'Could not share ride details',
                variant: 'destructive'
            });
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!booking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Booking not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20">
            <header className="bg-background shadow-sm p-4 flex items-center gap-4 sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold">Live Ride Status</h1>
            </header>
            
            <main className="flex flex-col">
                <div className="relative w-full h-64 md:h-96">
                    {mapUrl ? (
                         <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src={mapUrl}>
                        </iframe>
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <p>Loading map...</p>
                        </div>
                    )}
                </div>

                <div className="p-4 space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>Ride Details</CardTitle>
                                <CardDescription>Key information for your trip.</CardDescription>
                             </div>
                             <Button onClick={handleShare} variant="outline">
                                 <Share2 className="mr-2 h-4 w-4" />
                                 Share
                             </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 p-3 border rounded-lg">
                                    <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Passenger</p>
                                        <p className="font-semibold">{booking.client}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 border rounded-lg">
                                    <Phone className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Passenger Mobile</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{booking.mobile}</p>
                                            {passengerProfile?.mobileVerified && (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 border rounded-lg">
                                    <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Driver</p>
                                        <p className="font-semibold">{booking.driverName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 border rounded-lg">
                                    <Phone className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Driver Mobile</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{booking.driverMobile}</p>
                                             {driverProfile?.mobileVerified && (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicle Information</CardTitle>
                        </CardHeader>
                         <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="flex items-center gap-4 p-3 border rounded-lg">
                                <Car className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Vehicle Type</p>
                                    <p className="font-semibold">{booking.vehicleType}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4 p-3 border rounded-lg">
                                <Shield className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Vehicle Number</p>
                                    <p className="font-semibold">{booking.vehicleNumber}</p>
                                </div>
                            </div>
                         </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
    