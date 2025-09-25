

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Zap, MapPin, Milestone, Minus, Plus, Users, AlertCircle, CheckCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { getFirestore, addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { getApp } from "firebase/app";


import { getRoutes, getProfile, getCurrentUser, getBookings, saveBookings, logRouteView } from "@/lib/storage";
import type { Route, Booking, Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/app-layout";

const generateBookingCode = (bookingCount: number): string => {
    const nextId = (bookingCount + 1).toString().padStart(4, '0');
    return `MKS-${nextId}`;
}

export default function BookRidePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [route, setRoute] = useState<Route | null>(null);
  const [driverProfile, setDriverProfile] = useState<Profile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [seatsToAdd, setSeatsToAdd] = useState(1);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [isPast, setIsPast] = useState(false);
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  const [newlyBooked, setNewlyBooked] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchRouteAndBookings = async () => {
        const routeId = typeof params.id === 'string' ? params.id : '';
        if (routeId) {
            logRouteView(routeId);
        }

        const passengerEmail = getCurrentUser();
        if (!passengerEmail) {
            toast({
                title: "Please Login",
                description: "You need to be logged in to book a ride.",
                variant: "destructive",
            });
            router.push(`/login?redirect=/book/${params.id}`);
            return;
        }

        const allRoutes = await getRoutes(false, { routeId });
        const foundRoute = allRoutes.length > 0 ? allRoutes[0] : null;
        
        if (foundRoute) {
            setRoute(foundRoute);
            const profile = await getProfile(foundRoute.ownerEmail);
            if(profile) setDriverProfile(profile);

            setMessage(`Hello, I've just booked your ride! I'd be glad to travel with you. Can I get more information?`);
            
            const [depHours, depMinutes] = foundRoute.departureTime.split(':').map(Number);
            const departureDateTime = new Date(foundRoute.travelDate);
            departureDateTime.setHours(depHours, depMinutes, 0, 0);
            if (departureDateTime < new Date()) {
                setIsPast(true);
            }

            // Calculate available seats - This is the optimized part
            const bookingsForThisRoute = await getBookings(false, {
                destination: `${foundRoute.fromLocation} to ${foundRoute.toLocation}`,
                date: format(new Date(foundRoute.travelDate), 'yyyy-MM-dd'),
                time: foundRoute.departureTime
            });

            const bookedSeats = bookingsForThisRoute
              .filter(b => b.status !== "Cancelled")
              .reduce((acc, b) => acc + (Number(b.travelers) || 1), 0);
            
            setAvailableSeats(foundRoute.availableSeats - bookedSeats);
        }
        setIsLoaded(true);
    }
    fetchRouteAndBookings();
  }, [params.id, router, toast]);
  
  const handleSeatChange = (amount: number) => {
      setNumberOfSeats(prev => {
          const newSeats = prev + amount;
          if (newSeats < 1) return 1;
          if (newSeats > availableSeats) return availableSeats;
          return newSeats;
      })
  }

  const handleBooking = async () => {
    if (!route || isBooking || isPast) return;
    setIsBooking(true);

    const passengerEmail = getCurrentUser();
    
    if (!passengerEmail) {
        // This check is now mostly redundant due to useEffect, but good for safety
        toast({
            title: "Please Login",
            description: "You need to be logged in to book a ride.",
            variant: "destructive",
        });
        router.push(`/login?redirect=/book/${params.id}`);
        setIsBooking(false);
        return;
    }
    
    const passengerProfile = await getProfile(passengerEmail);

    if (!passengerProfile || !passengerProfile.mobile || passengerProfile.mobile === '0000000000') {
        toast({
            title: "Profile Incomplete",
            description: "Please complete your profile before booking.",
            variant: "destructive",
        });
        router.push(`/profile?role=passenger&redirect=/book/${params.id}`);
        setIsBooking(false);
        return;
    }
    
    if (numberOfSeats > availableSeats) {
         toast({
            title: "Not enough seats",
            description: `Sorry, there are only ${availableSeats} seats available for this ride.`,
            variant: "destructive",
        });
        setIsBooking(false);
        return;
    }
    
    const routeDate = new Date(route.travelDate);
    const [depHours, depMinutes] = route.departureTime.split(':').map(Number);
    routeDate.setHours(depHours, depMinutes, 0, 0);

    // Check for existing booking
    const allBookings = await getBookings(false, { 
        clientEmail: passengerEmail,
        destination: `${route.fromLocation} to ${route.toLocation}`,
        date: format(routeDate, 'yyyy-MM-dd'),
        time: route.departureTime
    });

    const foundExistingBooking = allBookings.find(b => b.status !== "Cancelled");

    if (foundExistingBooking) {
        setSeatsToAdd(1);
        setExistingBooking(foundExistingBooking);
        setIsBooking(false);
        return;
    }


    const db = getFirestore(getApp());
    const newBookingRef = doc(collection(db, 'bookings'));
    
    const allBookingsForCount = await getBookings(true);
    const newBookingCode = generateBookingCode(allBookingsForCount.length);

    const bookingData: Booking = {
        id: newBookingRef.id,
        bookingCode: newBookingCode,
        client: passengerProfile.name,
        clientEmail: passengerEmail,
        destination: `${route.fromLocation} to ${route.toLocation}`,
        departureDate: routeDate,
        returnDate: routeDate, 
        amount: route.price * numberOfSeats,
        status: "Pending",
        travelers: String(numberOfSeats),
        mobile: passengerProfile.mobile,
        driverName: route.driverName,
        driverEmail: route.ownerEmail,
        driverMobile: route.driverMobile,
        vehicleType: route.vehicleType,
        vehicleNumber: route.vehicleNumber,
        distance: route.distance,
    };
    
    const newBooking = Object.fromEntries(
      Object.entries(bookingData).filter(([, value]) => value !== undefined)
    );

    await setDoc(newBookingRef, newBooking);

    toast({
        title: "Booking Request Sent!",
        description: `Your ride for ${numberOfSeats} seat(s) has been requested. You will be notified once the driver confirms.`,
    });
    
    setNewlyBooked(newBooking as Booking);

    setIsBooking(false);
  };
  
  const handleUpdateBooking = async () => {
    if (!existingBooking || !route) return;
    
    setIsBooking(true);
    const totalSeats = (Number(existingBooking.travelers) || 0) + seatsToAdd;
    
    // Recalculate available seats to be sure.
    const allBookings = await getBookings(false, { 
        destination: `${route.fromLocation} to ${route.toLocation}`,
        date: format(new Date(route.travelDate), 'yyyy-MM-dd'),
        time: route.departureTime
    });

    const otherBookedSeats = allBookings
      .filter(b => b.id !== existingBooking.id && b.status !== "Cancelled")
      .reduce((acc, b) => acc + (Number(b.travelers) || 1), 0);
    
    const remainingSeats = route.availableSeats - otherBookedSeats;


    if (seatsToAdd > remainingSeats) {
         toast({
            title: "Not enough seats",
            description: `Cannot add ${seatsToAdd} more seats. Only ${remainingSeats} seats available in total.`,
            variant: "destructive",
        });
        setIsBooking(false);
        setExistingBooking(null);
        return;
    }

    const updatedBooking: Booking = {
      ...existingBooking,
      travelers: String(totalSeats),
      amount: route.price * totalSeats,
    };

    const db = getFirestore(getApp());
    const bookingRef = doc(db, 'bookings', existingBooking.id);
    await updateDoc(bookingRef, {
        travelers: updatedBooking.travelers,
        amount: updatedBooking.amount,
    });

    toast({
        title: "Booking Updated!",
        description: `Your booking now has ${totalSeats} seat(s).`,
    });
    
    setNewlyBooked(updatedBooking);

    setIsBooking(false);
    setExistingBooking(null);
  };
  
  const handleNotifyDriver = () => {
    if (!newlyBooked || !newlyBooked.driverMobile) return;
        
    const bookingDate = new Date(newlyBooked.departureDate);
    const formattedDate = format(bookingDate, 'dd MMM, yyyy');
    const formattedTime = format(bookingDate, 'p');

    const baseUrl = window.location.origin;
    const bookingLink = `${baseUrl}/my-routes?role=owner&booking_id=${newlyBooked.id}`;

    const message = `
Hello ${newlyBooked.driverName},

You have a new ride request from Mana Krushi Services.

*Booking Details:*
- *Passenger:* ${newlyBooked.client}
- *Route:* ${newlyBooked.destination}
- *Date:* ${formattedDate}
- *Time:* ${formattedTime}
- *Seats:* ${newlyBooked.travelers}
- *Amount:* ₹${newlyBooked.amount.toFixed(2)}

Please open this link to confirm or reject the booking:
${bookingLink}

Thank you,
Mana Krushi Services
    `.trim().replace(/^\s+/gm, '');
    
    const whatsappUrl = `https://wa.me/91${newlyBooked.driverMobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    router.push('/games');
  }


  if (!isLoaded) {
    return <AppLayout><div>Loading...</div></AppLayout>;
  }

  if (!route) {
    return <AppLayout><div>Route not found.</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/20">
        <header className="bg-background shadow-sm p-4 flex items-center gap-4">
            <h1 className="text-xl font-bold">Book online and secure your seat</h1>
        </header>

        <main className="p-4 space-y-4">
            {isPast && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Ride in Past</AlertTitle>
                    <AlertDescription>
                        This ride has already departed and can no longer be booked.
                    </AlertDescription>
                </Alert>
            )}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{format(new Date(route.travelDate), 'EEE dd MMM')}</CardTitle>
                         {driverProfile?.mobileVerified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" /> Verified Driver
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="flex gap-4">
                        <div>
                            <div className="font-semibold">{route.departureTime}</div>
                             <div className="h-10 text-xs text-muted-foreground flex items-center">
                                {route.distance && (
                                    <div className="flex items-center gap-2">
                                        <Milestone className="h-4 w-4" />
                                        <span>{route.distance.toFixed(0)} km</span>
                                    </div>
                                )}
                            </div>
                            <div className="font-semibold">{route.arrivalTime}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full border-2 border-primary mt-1"></div>
                            <div className="w-px flex-grow bg-border my-1"></div>
                            <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary mb-1"></div>
                        </div>
                        <div>
                            <div className="font-semibold">{route.fromLocation}</div>
                            <div className="h-10"></div>
                            <div className="font-semibold">{route.toLocation}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Price summary</CardTitle>
                    <CardDescription>
                        {availableSeats > 0 ? `${availableSeats} seats left` : 'Sold out'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Users className="h-6 w-6 text-muted-foreground" />
                             <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleSeatChange(-1)} disabled={numberOfSeats <= 1 || isPast || route.vehicleType === 'Bike'}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-bold text-lg w-8 text-center">{numberOfSeats}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleSeatChange(1)} disabled={numberOfSeats >= availableSeats || isPast || route.vehicleType === 'Bike'}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold">₹{(route.price * numberOfSeats).toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">Pay in the car</div>
                        </div>
                    </div>
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
                        disabled={isPast}
                    />
                </CardContent>
            </Card>

            <Button size="lg" className="w-full" onClick={handleBooking} disabled={isBooking || availableSeats === 0 || isPast}>
                {isBooking ? (
                    <>
                        <Zap className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                    </>
                ) : (
                    <>
                        <Zap className="mr-2 h-4 w-4" />
                        {isPast ? 'Ride has departed' : (availableSeats > 0 ? `Book for ${numberOfSeats} seat(s)` : 'Sold Out')}
                    </>
                )}
            </Button>
            
            <AlertDialog open={!!existingBooking} onOpenChange={(open) => !open && setExistingBooking(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>You already have a booking!</AlertDialogTitle>
                    <AlertDialogDescription>
                    You have a booking for this ride with {existingBooking?.travelers} seat(s).
                    How many more seats would you like to add?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-2 py-4">
                    <Label htmlFor="seats-to-add">Additional Seats</Label>
                    <Input
                        id="seats-to-add"
                        type="number"
                        value={seatsToAdd}
                        onChange={(e) => setSeatsToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        className="col-span-3"
                    />
                    </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setExistingBooking(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUpdateBooking}>Add Seats</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!newlyBooked} onOpenChange={(open) => !open && router.push('/games')}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Booking Request Sent!</AlertDialogTitle>
                    <AlertDialogDescription>
                    Your request is pending driver confirmation. You can now notify the driver via WhatsApp to get a faster response.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => router.push('/games')}>Skip</AlertDialogCancel>
                    <AlertDialogAction onClick={handleNotifyDriver} className="bg-green-500 hover:bg-green-600">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Notify Driver
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    </div>
    </AppLayout>
  );
}

    
