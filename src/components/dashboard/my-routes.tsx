
"use client";

import { useState, useMemo } from "react";
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
} from "@/components/ui/dialog";
import { User, Phone, Users, Calendar as CalendarIcon, DollarSign, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { getBookings, saveBookings } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface MyRoutesProps {
  routes: Route[];
}

const MyRoutes = ({ routes }: MyRoutesProps) => {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [bookingsForRoute, setBookingsForRoute] = useState<Booking[]>([]);
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const { toast } = useToast();

  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      const fromMatch = fromFilter ? route.fromLocation.toLowerCase().includes(fromFilter.toLowerCase()) : true;
      const toMatch = toFilter ? route.toLocation.toLowerCase().includes(toFilter.toLowerCase()) : true;
      const dateMatch = dateFilter ? format(new Date(route.travelDate), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd') : true;
      return fromMatch && toMatch && dateMatch;
    });
  }, [routes, fromFilter, toFilter, dateFilter]);

  const handleViewClick = (route: Route) => {
    const allBookings = getBookings();
    const routeBookings = allBookings.filter(
      (booking) => {
        const routeDate = new Date(route.travelDate);
        const bookingDate = new Date(booking.departureDate);
        
        return booking.destination === `${route.fromLocation} to ${route.toLocation}` &&
        routeDate.getFullYear() === bookingDate.getFullYear() &&
        routeDate.getMonth() === bookingDate.getMonth() &&
        routeDate.getDate() === bookingDate.getDate() &&
        format(booking.departureDate, "HH:mm") === route.departureTime
      }
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

  const getStatusInfo = (status: Booking['status']) => {
    switch(status) {
      case 'Confirmed':
        return { icon: CheckCircle, color: 'text-green-500', label: 'Confirmed' };
      case 'Pending':
         return { icon: AlertCircle, color: 'text-yellow-500', label: 'Pending' };
      default:
        return { icon: AlertCircle, color: 'text-muted-foreground', label: status };
    }
  }

  return (
    <Card className="shadow-sm mt-6">
      <CardHeader>
        <CardTitle>My Routes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input 
                placeholder="Filter by From location..."
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value)}
                className="max-w-sm"
            />
            <Input 
                placeholder="Filter by To location..."
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                className="max-w-sm"
            />
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {(fromFilter || toFilter || dateFilter) && (
                 <Button variant="ghost" onClick={() => { setFromFilter(''); setToFilter(''); setDateFilter(undefined); }}>Clear</Button>
            )}
        </div>
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
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
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
                    No routes found.
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
                  bookingsForRoute.map(booking => {
                    const StatusIcon = getStatusInfo(booking.status).icon;
                    const statusColor = getStatusInfo(booking.status).color;
                    return (
                    <div key={booking.id} className="border p-4 rounded-md space-y-4">
                       <div className="flex items-start gap-4">
                          <User className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Passenger Name</span>
                              <span className="font-medium">{booking.client}</span>
                          </div>
                      </div>
                       <div className="flex items-start gap-4">
                          <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Mobile Number</span>
                              <span className="font-medium">{booking.mobile}</span>
                          </div>
                      </div>
                       <div className="flex items-start gap-4">
                          <Users className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Travelers</span>
                              <span className="font-medium">{booking.travelers}</span>
                          </div>
                      </div>
                       <div className="flex items-start gap-4">
                          <StatusIcon className={`h-5 w-5 ${statusColor} mt-1`} />
                          <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Status</span>
                              <span className={`font-medium ${statusColor}`}>{booking.status}</span>
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
                  )})
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
