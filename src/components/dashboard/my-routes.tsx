
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Route, Booking, Profile } from "@/lib/types";
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
  DialogClose,
} from "@/components/ui/dialog";
import { User, Phone, Users, Calendar as CalendarIcon, DollarSign, Sparkles, CheckCircle, AlertCircle, Edit, Clock, MapPin } from "lucide-react";
import { getBookings, saveBookings, getProfile, getRoutes, saveRoutes } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "../ui/textarea";

interface MyRoutesProps {
  routes: Route[];
}

const editRouteSchema = z.object({
  fromLocation: z.string().min(2, "From location is required"),
  toLocation: z.string().min(2, "To location is required"),
  travelDate: z.date(),
  departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  arrivalTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  availableSeats: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  pickupPoints: z.string().optional(),
  dropOffPoints: z.string().optional(),
});


const MyRoutes = ({ routes: initialRoutes }: MyRoutesProps) => {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [bookingsForRoute, setBookingsForRoute] = useState<Booking[]>([]);
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const { toast } = useToast();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toll, setToll] = useState<number>(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof editRouteSchema>>({
    resolver: zodResolver(editRouteSchema),
  });

  useEffect(() => {
    setRoutes(initialRoutes);
  }, [initialRoutes]);

  useEffect(() => {
    if (selectedRoute && isEditDialogOpen) {
      form.reset({
        fromLocation: selectedRoute.fromLocation,
        toLocation: selectedRoute.toLocation,
        travelDate: new Date(selectedRoute.travelDate),
        departureTime: selectedRoute.departureTime,
        arrivalTime: selectedRoute.arrivalTime,
        availableSeats: selectedRoute.availableSeats,
        price: selectedRoute.price,
        pickupPoints: selectedRoute.pickupPoints?.join('\n') || '',
        dropOffPoints: selectedRoute.dropOffPoints?.join('\n') || '',
      });
    }
  }, [selectedRoute, isEditDialogOpen, form]);


  useEffect(() => {
    const fetchBookingsAndProfile = async () => {
        setAllBookings(await getBookings(true)); // Admin/Owner can see all
        setProfile(await getProfile());
    }
    fetchBookingsAndProfile();
  }, []);

  const getBookedSeats = (route: Route) => {
     return allBookings.filter(b => {
        const routeDate = new Date(route.travelDate);
        const bookingDate = new Date(b.departureDate);
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
    }).length;
  }

  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      const fromMatch = fromFilter ? route.fromLocation.toLowerCase().includes(fromFilter.toLowerCase()) : true;
      const toMatch = toFilter ? route.toLocation.toLowerCase().includes(toFilter.toLowerCase()) : true;
      const dateMatch = dateFilter ? format(new Date(route.travelDate), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd') : true;
      return fromMatch && toMatch && dateMatch;
    });
  }, [routes, fromFilter, toFilter, dateFilter]);

  const handleViewClick = (route: Route) => {
    const routeBookings = allBookings.filter(
      (booking) => {
        const routeDate = new Date(route.travelDate);
        const bookingDate = new Date(booking.departureDate);
        
        return booking.destination === `${route.fromLocation} to ${route.toLocation}` &&
        routeDate.getFullYear() === bookingDate.getFullYear() &&
        routeDate.getMonth() === bookingDate.getMonth() &&
        routeDate.getDate() === bookingDate.getDate() &&
        format(bookingDate, "HH:mm") === route.departureTime
      }
    );
    setSelectedRoute(route);
    setBookingsForRoute(routeBookings);
    const totalToll = routeBookings.reduce((acc, b) => acc + (b.toll || 0), 0);
    setToll(totalToll);
    setIsViewDialogOpen(true);
  };
  
  const handleEditClick = (route: Route) => {
    setSelectedRoute(route);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: z.infer<typeof editRouteSchema>) => {
    if (!selectedRoute) return;

    const allRoutes = await getRoutes(true);

    const updatedRoutes = allRoutes.map(r => 
      r.id === selectedRoute.id 
      ? { 
          ...r, 
          ...data,
          pickupPoints: data.pickupPoints?.split('\n').map(p => p.trim()).filter(p => p) || [],
          dropOffPoints: data.dropOffPoints?.split('\n').map(p => p.trim()).filter(p => p) || [],
        } 
      : r
    );

    await saveRoutes(updatedRoutes);
    setRoutes(updatedRoutes);
    toast({
      title: "Route Updated",
      description: "The route details have been successfully updated."
    });
    setIsEditDialogOpen(false);
    setSelectedRoute(null);
  }

  
  const handlePayment = async (bookingId: string, method: 'Cash' | 'UPI') => {
    const bookingsToUpdate = await getBookings(true);
    const updatedBookings = bookingsToUpdate.map(b => {
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
    await saveBookings(updatedBookings);
    setAllBookings(updatedBookings);
    setBookingsForRoute(prev => prev.map(b => b.id === bookingId ? {...b, clientEmail: b.clientEmail, paymentMethod: method, paymentStatus: 'Paid', status: 'Completed'} : b))
    toast({
      title: "Payment Recorded",
      description: `Payment for booking ${bookingId} has been recorded as ${method}.`,
    });
  }

  const handleTollUpdate = async () => {
     if (!selectedRoute) return;
     const bookingsToUpdate = await getBookings(true);
     const updatedBookings = bookingsToUpdate.map(b => {
         const isForThisRoute = bookingsForRoute.some(rb => rb.id === b.id);
         if (isForThisRoute) {
             return { ...b, toll: toll / bookingsForRoute.length }; // Distribute toll among bookings
         }
         return b;
     });
     await saveBookings(updatedBookings);
     setAllBookings(updatedBookings);
     setBookingsForRoute(prev => prev.map(b => ({ ...b, toll: toll / prev.length })));
     toast({
        title: "Toll Updated",
        description: `Toll of ₹${toll} has been recorded for this route.`,
     })
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

  const calculateEarnings = (route: Route) => {
      const routeBookings = allBookings.filter(b => {
        const routeDate = new Date(route.travelDate);
        const bookingDate = new Date(b.departureDate);
        const isSameDay = routeDate.getFullYear() === bookingDate.getFullYear() &&
                          routeDate.getMonth() === bookingDate.getMonth() &&
                          routeDate.getDate() === bookingDate.getDate();
        const bookingTime = format(bookingDate, 'HH:mm');

        return (
            b.destination === `${route.fromLocation} to ${route.toLocation}` &&
            isSameDay &&
            bookingTime === route.departureTime &&
            b.status === "Completed"
        );
    });

    const totalRevenue = routeBookings.reduce((acc, b) => acc + b.amount, 0);
    const totalToll = routeBookings.reduce((acc, b) => acc + (b.toll || 0), 0);
    
    // Simple calculation for now. AI calculation would be more complex.
    const fuelCost = (route.distance && profile?.mileage) 
        ? (route.distance / profile.mileage) * 100 // Assuming fuel price of 100
        : 0;

    return totalRevenue - fuelCost - totalToll;
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
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 bg-secondary hover:bg-secondary">
              <TableHead className="rounded-l-lg">From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Seats Left</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead className="rounded-r-lg text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoutes.length > 0 ? (
              filteredRoutes.map((route) => {
                  const bookedSeats = getBookedSeats(route);
                  const availableSeats = route.availableSeats - bookedSeats;
                  const earnings = calculateEarnings(route);
                  return (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.fromLocation}</TableCell>
                      <TableCell>{route.toLocation}</TableCell>
                      <TableCell>{format(new Date(route.travelDate), "dd MMM yyyy")}</TableCell>
                      <TableCell>{route.departureTime}</TableCell>
                      <TableCell>{availableSeats}/{route.availableSeats}</TableCell>
                        <TableCell>₹{earnings.toFixed(2)}</TableCell>
                      <TableCell className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewClick(route)}
                          >
                            View Bookings
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditClick(route)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>
                      </TableCell>
                    </TableRow>
                  )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No routes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* View Bookings Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bookings for {selectedRoute?.fromLocation} to {selectedRoute?.toLocation}</DialogTitle>
                <DialogDescription>
                  {selectedRoute && format(new Date(selectedRoute.travelDate), "PPP")} at {selectedRoute?.departureTime}
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

                        {selectedRoute && isRideComplete(selectedRoute) && (
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

                 {selectedRoute && isRideComplete(selectedRoute) && bookingsForRoute.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Post-Trip Details</h4>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number" 
                                placeholder="Total Toll Paid (₹)"
                                value={toll || ''}
                                onChange={(e) => setToll(Number(e.target.value))}
                                className="max-w-xs"
                            />
                            <Button size="sm" onClick={handleTollUpdate}>Save Toll</Button>
                        </div>
                    </div>
                 )}
              </div>
            </DialogContent>
        </Dialog>
        
        {/* Edit Route Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Route</DialogTitle>
              <DialogDescription>Make changes to your route details below.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4 py-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fromLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="toLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="travelDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Travel Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <FormField
                        control={form.control}
                        name="departureTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Departure Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="arrivalTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Arrival Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                  </div>
                  
                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="availableSeats"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Available Seats</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price per Seat (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                   </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="pickupPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Points</FormLabel>
                          <FormControl>
                            <Textarea placeholder="One point per line" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dropOffPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Drop-off Points</FormLabel>
                          <FormControl>
                            <Textarea placeholder="One point per line" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MyRoutes;
