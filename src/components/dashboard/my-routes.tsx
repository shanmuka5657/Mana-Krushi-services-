
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Route, Booking, Profile } from "@/lib/types";
import { format, addDays, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { User, Phone, Users, Calendar as CalendarIcon, IndianRupee, Sparkles, CheckCircle, AlertCircle, Edit, Clock, MapPin, Loader2, Share2, MessageSquare, QrCode, Copy, Search } from "lucide-react";
import { getBookings, saveBookings, getProfile, getRoutes, saveRoutes, getAllProfiles, getCurrentUserName, getCurrentUser } from "@/lib/storage";
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
import { Badge } from "../ui/badge";
import QRCode from "qrcode.react";


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
  const [bookedSeatsMap, setBookedSeatsMap] = useState<Map<string, number>>(new Map());
  const { toast } = useToast();
  const [allProfiles, setAllProfiles] = useState<Map<string, Profile>>(new Map());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [bookingUrl, setBookingUrl] = useState("");
  const [shareImageUrl, setShareImageUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<z.infer<typeof editRouteSchema>>({
    resolver: zodResolver(editRouteSchema),
  });

   useEffect(() => {
    const calculateBookedSeats = async () => {
        if (initialRoutes.length === 0) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);

        const newBookedSeatsMap = new Map<string, number>();

        // Fetch bookings for all displayed routes at once
        const bookingPromises = initialRoutes.map(route => {
            const routeDate = format(new Date(route.travelDate), 'yyyy-MM-dd');
            const routeTime = route.departureTime;
            return getBookings(false, { // Use false to indicate non-admin, more targeted fetch
                destination: `${route.fromLocation} to ${route.toLocation}`,
                date: routeDate,
                time: routeTime,
            });
        });
        
        const bookingsByRoute = await Promise.all(bookingPromises);

        initialRoutes.forEach((route, index) => {
            const bookingsForThisRoute = bookingsByRoute[index];
            const bookedSeats = bookingsForThisRoute
                .filter(b => b.status !== 'Cancelled')
                .reduce((acc, b) => acc + (Number(b.travelers) || 1), 0);
            newBookedSeatsMap.set(route.id, bookedSeats);
        });

        setBookedSeatsMap(newBookedSeatsMap);
        setRoutes(initialRoutes);
        setIsLoading(false);
    };

    calculateBookedSeats();
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

  const getProfileForUser = (email?: string): Profile | undefined => {
    if (!email) return undefined;
    return allProfiles.get(email);
  }


  const handleViewClick = async (route: Route) => {
    setSelectedRoute(route);
    setIsViewDialogOpen(true);

    // Fetch details on demand
    const routeDate = format(new Date(route.travelDate), 'yyyy-MM-dd');
    const routeTime = route.departureTime;
    
    const routeBookings = await getBookings(true, {
      destination: `${route.fromLocation} to ${route.toLocation}`,
      date: routeDate,
      time: routeTime,
    });
    
    routeBookings.sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());
    setBookingsForRoute(routeBookings);
    
    // Fetch profiles for these specific bookings if not already fetched
    const passengerEmails = routeBookings.map(b => b.clientEmail).filter(Boolean) as string[];
    const newProfilesToFetch = passengerEmails.filter(email => !allProfiles.has(email));

    if (newProfilesToFetch.length > 0) {
        const profilePromises = newProfilesToFetch.map(email => getProfile(email));
        const newProfiles = await Promise.all(profilePromises);
        
        setAllProfiles(prev => {
            const newMap = new Map(prev);
            newProfiles.forEach(p => {
                if (p) newMap.set(p.email, p);
            });
            return newMap;
        });
    }
  };
  
  const handleEditClick = (route: Route) => {
    setSelectedRoute(route);
    setIsEditDialogOpen(true);
  };
  
  const handleShareClick = async (route: Route) => {
    const url = `${window.location.origin}/book/${route.id}`;
    setBookingUrl(url);

    // Fetch profile only if needed
    let driverProfile = getProfileForUser(route.ownerEmail);
    if (!driverProfile) {
        driverProfile = await getProfile(route.ownerEmail);
        if (driverProfile) {
            setAllProfiles(prev => new Map(prev).set(driverProfile!.email, driverProfile!));
        }
    }
    
    setShareImageUrl(driverProfile?.selfieDataUrl);
    setSelectedRoute(route);
    setIsShareDialogOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookingUrl).then(() => {
      toast({ title: "Copied!", description: "Booking link copied to clipboard." });
    }, () => {
      toast({ title: "Failed to copy", variant: "destructive" });
    });
  };

  const handleEditSubmit = async (data: z.infer<typeof editRouteSchema,>) => {
    if (!selectedRoute) return;

    const allCurrentRoutes = await getRoutes(true);

    const updatedRoutes = allCurrentRoutes.map(r => 
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
    // Refresh the routes list from props after saving
    const ownerEmail = getCurrentUser();
    if(ownerEmail) {
        const latestOwnerRoutes = updatedRoutes.filter(r => r.ownerEmail === ownerEmail);
        setRoutes(latestOwnerRoutes);
    }
    
    toast({
      title: "Route Updated",
      description: "The route details have been successfully updated."
    });
    setIsEditDialogOpen(false);
    setSelectedRoute(null);
  }

  
  const handlePayment = async (bookingId: string, method: 'Cash' | 'UPI') => {
    const allBookings = await getBookings(true);
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
    await saveBookings(updatedBookings);
    setBookingsForRoute(prev => prev.map(b => b.id === bookingId ? {...b, paymentMethod: method, paymentStatus: 'Paid', status: 'Completed'} : b))
    toast({
      title: "Payment Recorded",
      description: `Payment for booking ${bookingId} has been recorded as ${method}.`,
    });
  }

  const handleShareLocation = (bookingId: string) => {
     if (!navigator.geolocation) {
      toast({ title: "Geolocation is not supported by your browser.", variant: 'destructive' });
      return;
    }

    const success = async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        const allBookings = await getBookings(true);
        const updatedBookings = allBookings.map(b => 
            b.id === bookingId ? { ...b, driverLatitude: latitude, driverLongitude: longitude } : b
        );
        await saveBookings(updatedBookings);
        setBookingsForRoute(prev => prev.map(b => b.id === bookingId ? {...b, driverLatitude: latitude, driverLongitude: longitude} : b))
        
        toast({ title: 'Location Shared!', description: 'Your current location has been shared with the passenger.' });
    };

    const error = () => {
        toast({ title: "Unable to retrieve your location.", description: "Please ensure location services are enabled.", variant: 'destructive' });
    };

    toast({ title: "Getting your location..." });
    navigator.geolocation.getCurrentPosition(success, error);
  };
  
  const handleWhatsAppToPassenger = (booking: Booking, type: 'confirmation' | 'payment') => {
    if (!booking.mobile) return;

    let message = '';
    const bookingDate = new Date(booking.departureDate);
    const formattedDate = format(bookingDate, 'dd MMM, yyyy');
    const formattedTime = format(bookingDate, 'p');

    if (type === 'confirmation') {
       message = `
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
    `.trim().replace(/^\s+/gm, '');
    } else if (type === 'payment') {
        const upiId = "7569114679@ybl";
        const upiUrl = `upi://pay?pa=${upiId}&pn=Mana%20Krushi%20Services&am=${booking.amount.toFixed(2)}&tn=RidePayment${booking.id}`;
        
        message = `
Hello ${booking.client},

Thank you for travelling with Mana Krushi Services!

This is a reminder for your payment of *₹${booking.amount.toFixed(2)}*.

You can pay via UPI using this link: ${upiUrl}

Alternatively, you can pay in cash. Let me know what you prefer.

Thanks,
${booking.driverName}
    `.trim().replace(/^\s+/gm, '');
    }
    
    const whatsappUrl = `https://wa.me/${booking.mobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };


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
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <Card className="shadow-sm mt-6">
      <CardHeader>
        <CardTitle>My Routes</CardTitle>
        <CardDescription>A list of your upcoming and past routes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
              <TableRow className="border-b-0 bg-secondary hover:bg-secondary">
              <TableHead className="rounded-l-lg">From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Seats Left</TableHead>
              <TableHead className="rounded-r-lg text-center">Actions</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {routes.length > 0 ? (
              routes.map((route) => {
                  const bookedSeats = bookedSeatsMap.get(route.id) || 0;
                  const availableSeats = route.availableSeats - bookedSeats;
                  return (
                      <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.fromLocation}</TableCell>
                      <TableCell>{route.toLocation}</TableCell>
                      <TableCell>{format(new Date(route.travelDate), "dd MMM yyyy")}</TableCell>
                      <TableCell>{route.departureTime}</TableCell>
                      <TableCell>{availableSeats}/{route.availableSeats}</TableCell>
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
                          <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleShareClick(route)}
                          >
                              <QrCode className="h-4 w-4" />
                          </Button>
                      </TableCell>
                      </TableRow>
                  )
              })
              ) : (
              <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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
                    const passengerProfile = getProfileForUser(booking.clientEmail);
                    return (
                    <div key={booking.id} className="border p-4 rounded-md space-y-4">
                       <p className="font-mono text-xs text-muted-foreground">ID: {booking.bookingCode || booking.id}</p>
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
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{booking.mobile}</span>
                                {passengerProfile?.mobileVerified && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                        <CheckCircle className="h-3 w-3 mr-1" /> Verified
                                    </Badge>
                                )}
                              </div>
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

                        <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2">
                            {booking.status === 'Completed' && booking.paymentStatus !== 'Paid' ? (
                                <>
                                  <p className="text-sm text-muted-foreground mb-2 sm:mb-0">Payment:</p>
                                  <div className="flex gap-2">
                                      <Button size="sm" variant="outline" onClick={() => handlePayment(booking.id, 'Cash')}>
                                          <IndianRupee className="mr-2 h-4 w-4" /> Cash
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => handlePayment(booking.id, 'UPI')}>
                                         <Sparkles className="mr-2 h-4 w-4" /> UPI
                                      </Button>
                                  </div>
                                </>
                            ) : booking.paymentStatus === 'Paid' ? (
                                <div className="flex items-center gap-2">
                                    <IndianRupee className="h-5 w-5 text-green-500" />
                                    <span className="font-medium text-green-500">Paid via {booking.paymentMethod}</span>
                                </div>
                            ) : null}
                            
                            {booking.status !== 'Cancelled' && (
                                <>
                                {booking.status !== 'Completed' &&
                                    <Button size="sm" variant="outline" onClick={() => handleShareLocation(booking.id)}>
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share My Location
                                    </Button>
                                }
                                 <Button size="sm" variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100" onClick={() => handleWhatsAppToPassenger(booking, booking.status === 'Completed' ? 'payment' : 'confirmation')}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    {booking.status === 'Completed' ? 'Send Payment Link' : 'WhatsApp'}
                                </Button>
                                </>
                            )}
                        </div>
                    </div>
                  )})
                ) : (
                  <p>No bookings for this route yet.</p>
                )}
              </div>
            </DialogContent>
        </Dialog>
        
        {/* Share Route Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Route</DialogTitle>
              <DialogDescription>
                Share this QR code or link to allow passengers to book this ride directly.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg">
                <QRCode
                  value={bookingUrl}
                  size={256}
                  level="H"
                  imageSettings={
                    shareImageUrl
                      ? {
                          src: shareImageUrl,
                          height: 40,
                          width: 40,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              </div>
              <div className="w-full flex gap-2">
                <Input value={bookingUrl} readOnly className="flex-grow" />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
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
