
"use client";

import { useState, useEffect, useMemo, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getBookings, getAllProfiles, stopTracking as stopTrackingInDb, updateLocation as updateLocationInDb } from '@/lib/storage';
import type { Booking, Profile, LiveLocation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Phone, Car, Shield, Share2, CheckCircle, MapPin, Loader2, Pin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getApp } from "firebase/app";

import 'leaflet/dist/leaflet.css';
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import L from 'leaflet';


// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false, loading: () => <p>Loading map...</p> });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });


// This component will auto-adjust the map view
function ChangeView({ center, zoom }: { center: L.LatLngExpression, zoom: number }) {
  const useMap = dynamic(() => import('react-leaflet').then(mod => mod.useMap), { ssr: false });
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Create a memoized map component to prevent re-renders
const LiveMap = memo(({ center, zoom, location }: { center: L.LatLngExpression, zoom: number, location: LiveLocation | null }) => {
    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {location && (
                <Marker position={[location.latitude, location.longitude]}>
                    <Popup>
                        Driver's Location <br /> Last seen: {location.timestamp.toLocaleTimeString()}
                    </Popup>
                </Marker>
            )}
            <ChangeView center={center} zoom={zoom} />
        </MapContainer>
    );
});
LiveMap.displayName = 'LiveMap';


export default function TrackRidePage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [passengerProfile, setPassengerProfile] = useState<Profile | null>(null);
    const [driverProfile, setDriverProfile] = useState<Profile | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null);
    const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([20.5937, 78.9629]); // Default to India
    const [mapZoom, setMapZoom] = useState(5);

    useEffect(() => {
        const bookingId = typeof params.id === 'string' ? params.id : '';
        if (!bookingId) {
            setIsLoaded(true);
            return;
        };

        const fetchBookingAndProfiles = async () => {
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
            }
            setIsLoaded(true);
        };
        
        fetchBookingAndProfiles();

        const app = getApp();
        const db = getDatabase(app);
        const rideRef = ref(db, `rides/${bookingId}/actors/driver`);

        const unsubscribe = onValue(rideRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.lat && data.lon) {
                 const location: LiveLocation = {
                    latitude: data.lat,
                    longitude: data.lon,
                    timestamp: new Date(data.ts),
                };
                setLiveLocation(location);
                setMapCenter([data.lat, data.lon]);
                setMapZoom(15);
            }
        });

        // Simulate driver movement for demo purposes
        const simulateDriverMovement = async () => {
            if (process.env.NODE_ENV === 'development') {
                 console.log("Simulating driver location update for booking: ", bookingId);
                 // Simulate movement around a central point
                 const newLat = 17.3850 + (Math.random() - 0.5) * 0.01;
                 const newLon = 78.4867 + (Math.random() - 0.5) * 0.01;
                 
                 const db_write = getDatabase(getApp());
                 const node = ref(db_write, `rides/${bookingId}/actors/driver`);
                 await set(node, { lat: newLat, lon: newLon, ts: Date.now() });
            }
        }
        const intervalId = setInterval(simulateDriverMovement, 10000); // update every 10 seconds


        return () => {
            unsubscribe();
            clearInterval(intervalId);
        };

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
            <header className="bg-background shadow-sm p-4 flex items-center gap-4 sticky top-0 z-40">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold">Live Ride Status</h1>
            </header>
            
            <main className="flex flex-col">
                <div className="relative w-full h-64 md:h-96 z-0">
                    <LiveMap center={mapCenter} zoom={mapZoom} location={liveLocation} />
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
                                <a href={`tel:${booking.driverMobile}`} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
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
                                </a>
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
