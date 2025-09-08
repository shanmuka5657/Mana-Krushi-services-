
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";
import { format } from "date-fns";

import { getRoutes, getBookings, saveBookings } from "@/lib/storage";
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

  useEffect(() => {
    const routes = getRoutes();
    const routeId = typeof params.id === 'string' ? params.id : '';
    const foundRoute = routes.find((r) => r.id === routeId);
    if (foundRoute) {
      setRoute(foundRoute);
      setMessage(`Hello, I've just booked your ride! I'd be glad to travel with you. Can I get more information?`);
    }
    setIsLoaded(true);
  }, [params.id]);

  const handleBooking = () => {
    if (!route) return;

    const bookings = getBookings();
    const newBooking: Booking = {
        id: `#BK${(bookings.length + 1).toString().padStart(3, '0')}`,
        client: 'Passenger User', // Placeholder name
        destination: `${route.fromLocation} to ${route.toLocation}`,
        departureDate: route.travelDate, // This should combine date and time
        returnDate: route.travelDate, // Not applicable for one-way, but schema requires it
        amount: route.price,
        status: "Confirmed",
        travelers: "1",
        mobile: '1234567890', // Placeholder
    };
    
    // A bit of a hack to combine date and time for storage
    const [depHours, depMinutes] = route.departureTime.split(':').map(Number);
    newBooking.departureDate.setHours(depHours, depMinutes);


    const updatedBookings = [newBooking, ...bookings];
    saveBookings(updatedBookings);

    toast({
        title: "Booking Confirmed!",
        description: "Your ride has been successfully booked.",
    });

    router.push('/dashboard?role=passenger');
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

            <Button size="lg" className="w-full" onClick={handleBooking}>
                <Zap className="mr-2 h-4 w-4" />
                Book
            </Button>
        </main>
    </div>
  );
}
