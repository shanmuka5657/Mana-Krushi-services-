
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Route, Booking } from "@/lib/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { User, Phone, Users, Calendar, Clock, DollarSign, Sparkles } from "lucide-react";
import { getBookings, saveBookings } from "@/lib/storage";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface MyRoutesProps {
  routes: Route[];
}

const MyRoutes = ({ routes }: MyRoutesProps) => {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [bookingsForRoute, setBookingsForRoute] = useState<Booking[]>([]);
  const { toast } = useToast();

  const handleViewClick = (route: Route) => {
    const allBookings = getBookings();
    const routeBookings = allBookings.filter(
      (booking) =>
        booking.destination === `${route.fromLocation} to ${route.toLocation}` &&
        format(new Date(booking.departureDate), "yyyy-MM-dd") === format(new Date(route.travelDate), "yyyy-MM-dd") &&
        format(new Date(booking.departureDate), "HH:mm") === route.departureTime
    );
    setSelectedRoute(route);
    setBookingsForRoute(routeBookings);
  };
  
  const handlePayment = (bookingId: string, method: 'Cash' | 'UPI') => {
    const allBookings = getBookings();
    const updatedBookings = allBookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          paymentMethod: method,
          paymentStatus: "Paid" as const,
          status: "Completed" as const,
        }
      }
      return b;
    });
    saveBookings(updatedBookings);
    setBookingsForRoute(prev => prev.map(b => b.id === bookingId ? {...b, paymentMethod: method, paymentStatus: 'Paid', status: 'Completed'} : b))
    toast({
      title: "Payment Recorded",
      description: `Payment for booking ${bookingId} has been recorded as ${method}.`,
    });
  }
  
  const isRideComplete = (route: Route) => {
      const routeDateTime = new Date(route.travelDate);
      const [hours, minutes] = route.arrivalTime.split(':').map(Number);
      routeDateTime.setHours(hours, minutes);
      return routeDateTime < new Date();
  }

  return (
    <Card className="shadow-sm mt-6">
      <CardHeader>
        <CardTitle>My Routes</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedRoute(null)}>
          <Table>
            <TableHeader>
              <TableRow className="border-b-0 bg-secondary hover:bg-secondary">
                <TableHead className="rounded-l-lg">From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead className="rounded-r-lg">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.length > 0 ? (
                routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.fromLocation}</TableCell>
                    <TableCell>{route.toLocation}</TableCell>
                    <TableCell>{format(route.travelDate, "dd MMM yyyy")}</TableCell>
                    <TableCell>{route.departureTime}</TableCell>
                    <TableCell>{route.availableSeats}</TableCell>
                    <TableCell>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewClick(route)}
                        >
                          View Bookings
                        </Button>
                      </DialogTrigger>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No routes added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {selectedRoute && (
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bookings for {selectedRoute.fromLocation} to {selectedRoute.toLocation}</DialogTitle>
                <DialogDescription>
                  {format(new Date(selectedRoute.travelDate), "PPP")} at {selectedRoute.departureTime}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {bookingsForRoute.length > 0 ? (
                  bookingsForRoute.map(booking => (
                    <div key={booking.id} className="border p-4 rounded-md">
                        <div className="flex items-center gap-4">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Client Name</span>
                                <span className="font-medium">{booking.client}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Mobile Number</span>
                                <span className="font-medium">{booking.mobile}</span>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 mt-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Departure Time</span>
                                <span className="font-medium">{format(booking.departureDate, "HH:mm")}</span>
                            </div>
                        </div>
                        {isRideComplete(selectedRoute) && (
                            <div className="mt-4 pt-4 border-t">
                               <p className="text-sm text-muted-foreground mb-2">Payment</p>
                               {booking.paymentStatus === 'Paid' ? (
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-500" />
                                        <span className="font-medium text-green-500">Paid via {booking.paymentMethod}</span>
                                    </div>
                               ) : (
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handlePayment(booking.id, 'Cash')}>
                                        <DollarSign className="mr-2 h-4 w-4" /> Cash
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handlePayment(booking.id, 'UPI')}>
                                       <Sparkles className="mr-2 h-4 w-4" /> UPI
                                    </Button>
                                </div>
                               )}
                            </div>
                        )}
                    </div>
                  ))
                ) : (
                  <p>No bookings for this route yet.</p>
                )}
              </div>
            </DialogContent>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MyRoutes;
