
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Zap, MapPin } from "lucide-react";
import { format } from "date-fns";
import { getFirestore, addDoc, collection, doc, setDoc } from "firebase/firestore";
import { getApp } from "firebase/app";


import { getRoutes, getProfile, getCurrentUser, getBookings } from "@/lib/storage";
import type { Route, Booking } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function BookRidePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchRoute = async () => {
        const routes = await getRoutes();
        const routeId = typeof params.id === 'string' ? params.id : '';
        const foundRoute = routes.find((r) => r.id === routeId);
        if (foundRoute) {
            setRoute(foundRoute);
            setMessage(`Hello, I've just booked your ride! I'd be glad to travel with you. Can I get more information?`);
        }
        setIsLoaded(true);
    }
    fetchRoute();
  }, [params.id]);

  const handleBooking = async () => {
    if (!route || isBooking) return;
    setIsBooking(true);

    const passengerProfile = await getProfile();
    const passengerEmail = getCurrentUser();

    if (!passengerProfile || !passengerEmail) {
        toast({
            title: "Profile Incomplete",
            description: "Please complete your profile before booking.",
            variant: "destructive",
        });
        router.push('/profile?role=passenger');
        setIsBooking(false);
        return;
    }
    
    // Check for available seats
    const allBookings = await getBookings(true); // Get all bookings for seat check
    const bookingsForThisRoute = allBookings.filter(b => {
        const routeDate = new Date(route.travelDate);
        const bookingDate = new Date(b.departureDate);
        // Compare year, month, and day
        const isSameDay = routeDate.getFullYear() === bookingDate.getFullYear() &&
                          routeDate.getMonth() === bookingDate.getMonth() &&
                          routeDate.getDate() === bookingDate.getDate();

        const bookingTime = format(bookingDate, 'HH:mm');

        return (
            b.destination === `${route.fromLocation} to ${route.toLocation}` &&
            isSameDay &&
            bookingTime === route.departureTime &&
            b.status !== "Cancelled"
        );
    });

    if (bookingsForThisRoute.length >= route.availableSeats) {
         toast({
            title: "Ride Sold Out",
            description: "Sorry, there are no more available seats for this ride.",
            variant: "destructive",
        });
        setIsBooking(false);
        return;
    }

    const db = getFirestore(getApp());
    const newBookingRef = doc(collection(db, 'bookings'));

    const newBooking: Booking = {
        id: newBookingRef.id,
        client: passengerProfile.name,
        clientEmail: passengerEmail,
        destination: `${route.fromLocation} to ${route.toLocation}`,
        departureDate: new Date(route.travelDate),
        returnDate: new Date(route.travelDate), 
        amount: route.price,
        status: "Confirmed",
        travelers: "1",
        mobile: passengerProfile.mobile,
        driverName: route.driverName,
        driverMobile: route.driverMobile,
        vehicleType: route.vehicleType,
    };
    
    const [depHours, depMinutes] = route.departureTime.split(':').map(Number);
    newBooking.departureDate.setHours(depHours, depMinutes, 0, 0); // Also reset seconds/ms

    await setDoc(newBookingRef, newBooking);

    toast({
        title: "Booking Confirmed!",
        description: "Your ride has been successfully booked.",
    });

    router.push('/bookings?role=passenger');
    setIsBooking(false);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!route) {
    return <div>Route not found.</div>;
  }

  return (
    <div className="min-h-screen bg-muted/20">
        <header className="bg-background shadow-sm p-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft />
            </Button>
            <h1 className="text-xl font-bold">Book online and secure your seat</h1>
        </header>

        <main className="p-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{format(new Date(route.travelDate), 'EEE dd MMM')}</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="flex gap-4">
                        <div>
                            <div className="font-semibold">{route.departureTime}</div>
                            <div className="h-10"></div>
                            <div className="font-semibold">{route.arrivalTime}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full border-2 border-primary mt-1"></div>
                            <div className="w-px flex-grow bg-border my-1"></div>
                            <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary mb-1"></div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">{route.fromLocation}</div>
                            <div className="h-10"></div>
                            <div className="text-muted-foreground">{route.toLocation}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        <span>Route Map</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video w-full rounded-md overflow-hidden border">
                         <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps/embed/v1/directions?key=${mapsApiKey}&origin=${encodeURIComponent(route.fromLocation)}&destination=${encodeURIComponent(route.toLocation)}`}>
                        </iframe>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Price summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span>1 seat: ₹{(route.price || 0).toFixed(2)}</span>
                        <span className="font-semibold">Cash</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Pay in the car</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Send a message to {route.driverName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Introduce yourself..."
                        rows={4}
                        className="bg-muted/50"
                    />
                </CardContent>
            </Card>

            <Button size="lg" className="w-full" onClick={handleBooking} disabled={isBooking}>
                {isBooking ? (
                    <>
                        <Zap className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                    </>
                ) : (
                    <>
                        <Zap className="mr-2 h-4 w-4" />
                        Book
                    </>
                )}
            </Button>
        </main>
    </div>
  );
}
