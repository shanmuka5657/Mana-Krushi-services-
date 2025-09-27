

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Clock, User, Phone, Car, MapPin, Users, Calendar as CalendarIcon, DollarSign, Wand2, Loader2, Shield, Sparkles, Star, X, Bike, Milestone, Eye, Edit, QrCode, MessagesSquare, MessageSquare, CheckCircle, LocateFixed } from "lucide-react";
import { format, addDays, parse, isToday } from "date-fns";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { getProfile, saveProfile, getCurrentUser, getRoutes, getBookings, getRouteViews, saveBookings } from "@/lib/storage";
import PaymentDialog from "./payment-dialog";
import type { Profile, Route, Booking } from "@/lib/types";
import { calculateDistance, getMapSuggestions, reverseGeocode } from "@/app/actions";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import MyRoutes from "./my-routes";


const ownerFormSchema = z.object({
  ownerName: z.string().min(2, "Owner name is required."),
  ownerEmail: z.string().email(),
  driverName: z.string().min(2, "Driver name is required."),
  driverMobile: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number."),
  fromLocation: z.string().min(2, "Starting location is required.").transform(val => val.trim()),
  toLocation: z.string().min(2, "Destination is required.").transform(val => val.trim()),
  travelDate: z.date({
    required_error: "A travel date is required.",
  }),
  departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  arrivalTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  availableSeats: z.coerce.number().int().positive("Available seats must be a positive number."),
  price: z.coerce.number().positive("Price must be a positive number."),
  rating: z.coerce.number().min(1).max(5).default(Math.round((Math.random() * 2 + 3) * 10) / 10), // Random rating between 3 and 5
  vehicleType: z.string({ required_error: "Please select a vehicle type." }),
  vehicleNumber: z.string().optional(),
});

export type OwnerFormValues = z.infer<typeof ownerFormSchema>;

interface OwnerDashboardProps {
  onRouteAdded: (newRoute: OwnerFormValues & { isPromoted?: boolean, distance?: number }) => void;
  onSwitchTab: (tab: string) => void;
  profile: Profile;
}

const LocationAutocompleteInput = ({
    field,
    placeholder,
}: {
    field: any;
    placeholder: string;
}) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        const result = await getMapSuggestions(query);
        setIsLoading(false);
        if (result.error) {
             console.error("Error fetching map suggestions:", result.error);
        } else if(result.suggestions) {
            setSuggestions(result.suggestions);
        }
    }, []);

    const onInputChange = (value: string) => {
        field.onChange(value);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    return (
        <div className="relative">
            <div className="relative">
                 <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    {...field}
                    placeholder={placeholder}
                    className="pl-10"
                    onChange={(e) => onInputChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 150)} 
                    autoComplete="off"
                />
            </div>
            {isFocused && (isLoading || suggestions.length > 0) && (
                <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                    {isLoading ? (
                        <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                    ) : (
                        suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="p-2 hover:bg-muted cursor-pointer"
                                onMouseDown={() => {
                                    field.onChange(suggestion.placeName);
                                    setSuggestions([]);
                                }}
                            >
                                <p className="font-semibold">{suggestion.placeName}</p>
                                <p className="text-xs text-muted-foreground">{suggestion.placeAddress}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const getTravelDuration = (departureTime?: string, arrivalTime?: string): string => {
    if (!departureTime || !arrivalTime) return "";
    try {
        const departure = new Date(`1970-01-01T${departureTime}:00`);
        const arrival = new Date(`1970-01-01T${arrivalTime}:00`);
        const diffMinutes = (arrival.getTime() - departure.getTime()) / (1000 * 60);
        if (diffMinutes < 0) return "";

        const hours = Math.floor(diffMinutes / 60);
        
        return `${hours}h`;

    } catch (e) {
        return "";
    }
}

export default function OwnerDashboard({ onRouteAdded, onSwitchTab, profile }: OwnerDashboardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [routeDataToSubmit, setRouteDataToSubmit] = useState<(OwnerFormValues & { isPromoted?: boolean, distance?: number }) | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [todaysRoutes, setTodaysRoutes] = useState<Route[]>([]);
  const [bookedSeatsMap, setBookedSeatsMap] = useState<Map<string, number>>(new Map());
  const [routeViewsMap, setRouteViewsMap] = useState<Map<string, number>>(new Map());
  const [isTodaysRoutesLoading, setIsTodaysRoutesLoading] = useState(true);
  const [selectedRouteForView, setSelectedRouteForView] = useState<Route | null>(null);
  const [bookingsForRoute, setBookingsForRoute] = useState<Booking[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);


  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerFormSchema),
    defaultValues: {
        ownerName: profile.name || "",
        ownerEmail: profile.email || "",
        driverName: profile.name || "",
        driverMobile: (profile.mobile && profile.mobile !== '0000000000') ? profile.mobile : "",
        fromLocation: "",
        toLocation: "",
        travelDate: new Date(),
        departureTime: "09:00",
        arrivalTime: "18:00",
        availableSeats: 1,
        price: 500,
        rating: 4.5,
        vehicleType: profile.vehicleType || "Car",
        vehicleNumber: "",
    },
  });

  const fromLocation = useWatch({ control: form.control, name: 'fromLocation' });
  const toLocation = useWatch({ control: form.control, name: 'toLocation' });
  const vehicleType = useWatch({ control: form.control, name: 'vehicleType' });
  
  const fetchTodaysRoutesAndDetails = useCallback(async () => {
    const ownerEmail = getCurrentUser();
    if (!ownerEmail) {
        setIsTodaysRoutesLoading(false);
        return;
    }
    // Only show loader on initial load
    if (isTodaysRoutesLoading) {
      // no change, keep it as it is
    } else {
       setIsTodaysRoutesLoading(false);
    }

    const allRoutes = await getRoutes(false, { ownerEmail });
    const todayRoutes = allRoutes.filter(route => isToday(new Date(route.travelDate)));

    setTodaysRoutes(todayRoutes);

    if (todayRoutes.length > 0) {
        const newBookedSeatsMap = new Map<string, number>();
        const newRouteViewsMap = new Map<string, number>();

        const bookingPromises = todayRoutes.map(route => {
            const routeDate = format(new Date(route.travelDate), 'yyyy-MM-dd');
            return getBookings(true, {
                destination: `${route.fromLocation} to ${route.toLocation}`,
                date: routeDate,
                time: route.departureTime,
            });
        });

        const viewPromises = todayRoutes.map(route => getRouteViews(route.id));

        const [bookingsByRoute, viewsByRoute] = await Promise.all([
            Promise.all(bookingPromises),
            Promise.all(viewPromises),
        ]);

        todayRoutes.forEach((route, index) => {
            const bookingsForThisRoute = bookingsByRoute[index];
            const bookedSeats = bookingsForThisRoute
                .filter(b => b.status !== 'Cancelled')
                .reduce((acc, b) => acc + (Number(b.travelers) || 1), 0);
            newBookedSeatsMap.set(route.id, bookedSeats);
            newRouteViewsMap.set(route.id, viewsByRoute[index] || 0);
        });

        setBookedSeatsMap(newBookedSeatsMap);
        setRouteViewsMap(newRouteViewsMap);
    }
    setIsTodaysRoutesLoading(false);
}, [isTodaysRoutesLoading]);

useEffect(() => {
    fetchTodaysRoutesAndDetails(); // Initial fetch
    const intervalId = setInterval(() => {
        fetchTodaysRoutesAndDetails();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
}, [fetchTodaysRoutesAndDetails]);

  
  useEffect(() => {
    if (vehicleType === 'Bike') {
        form.setValue('availableSeats', 1);
    }
  }, [vehicleType, form]);

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation is not supported by your browser.", variant: "destructive" });
      return;
    }
    
    setIsGettingLocation(true);
    toast({ title: "Getting your location..." });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const result = await reverseGeocode(latitude, longitude);
        setIsGettingLocation(false);

        if (result.error) {
          toast({ title: "Could not get address", description: result.error, variant: "destructive" });
        } else if (result.address) {
          form.setValue("fromLocation", result.address, { shouldValidate: true });
          toast({ title: "Location set!", description: result.address });
        }
      },
      () => {
        setIsGettingLocation(false);
        toast({ title: "Unable to retrieve your location.", description: "Please ensure location permissions are enabled.", variant: "destructive" });
      }
    );
  };


  async function onSubmit(data: OwnerFormValues) {
    const ownerEmail = getCurrentUser();
    if(!ownerEmail) {
        toast({ title: "Error", description: "Could not identify current user. Please log in again.", variant: "destructive" });
        return;
    }

    if (!profile?.planExpiryDate) {
        toast({
            title: "Owner Plan Required",
            description: "Please activate your owner plan in your profile before adding a route.",
            variant: "destructive"
        });
        onSwitchTab('profile');
        return;
    }
    
    const allExistingRoutesToday = await getRoutes(false, { ownerEmail });
    
    const existingRoutesOfSameType = allExistingRoutesToday.filter(
        route => route.vehicleType === data.vehicleType
    );

    const routeDate = data.travelDate;
    const newStart = parse(data.departureTime, 'HH:mm', routeDate).getTime();
    const newEnd = parse(data.arrivalTime, 'HH:mm', routeDate).getTime();

    for (const existingRoute of existingRoutesOfSameType) {
        const existingRouteDate = new Date(existingRoute.travelDate);
        
        if (format(routeDate, 'yyyy-MM-dd') !== format(existingRouteDate, 'yyyy-MM-dd')) {
            continue;
        }

        const existingStart = parse(existingRoute.departureTime, 'HH:mm', existingRouteDate).getTime();
        const existingEnd = parse(existingRoute.arrivalTime, 'HH:mm', existingRouteDate).getTime();

        if (newStart < existingEnd && newEnd > existingStart) {
             toast({
                title: "Time Conflict",
                description: `This ${data.vehicleType} route overlaps with your existing ${data.vehicleType} route from ${existingRoute.departureTime} to ${existingRoute.arrivalTime} on ${format(existingRouteDate, 'PPP')}.`,
                variant: "destructive"
            });
            return;
        }
    }

    const distanceResult = await calculateDistance({from: data.fromLocation, to: data.toLocation});

    const dataWithVehicleInfo = {
        ...data,
        distance: distanceResult.distance,
        ownerEmail: ownerEmail,
        vehicleType: data.vehicleType, 
        vehicleNumber: profile.vehicleNumber,
    };

    setRouteDataToSubmit(dataWithVehicleInfo);
    setShowPromotionDialog(true);
  }

  const handlePromotionChoice = (isPromoted: boolean) => {
    setShowPromotionDialog(false);
    if (!routeDataToSubmit) return;

    const routeDataWithPromotion = { ...routeDataToSubmit, isPromoted };
    
    if (isPromoted) {
      setRouteDataToSubmit(routeDataWithPromotion);
      setIsPaymentDialogOpen(true);
    } else {
      handleRouteSubmission(routeDataWithPromotion);
    }
  };

  const handleRouteSubmission = async (data: OwnerFormValues & { isPromoted?: boolean, distance?: number }) => {
    await onRouteAdded(data);
    toast({
      title: "Route Added!",
      description: `Your route from ${data.fromLocation} to ${data.toLocation} has been added.`,
    });
    
    // Refresh today's routes list
    fetchTodaysRoutesAndDetails();
  }
  
  const handlePaymentSuccess = async () => {
    if (routeDataToSubmit) {
      handleRouteSubmission(routeDataToSubmit);
    }
  }
  
  const handleViewBookings = async (route: Route) => {
    setSelectedRouteForView(route);
    setIsViewDialogOpen(true);
    
    // Fetch details on demand
    const routeDate = format(new Date(route.travelDate), 'yyyy-MM-dd');
    const routeTime = route.departureTime;
    
    const routeBookings = await getBookings(true, {
      destination: `${route.fromLocation} to ${route.toLocation}`,
      date: routeDate,
      time: routeTime,
    });
    
    setBookingsForRoute(routeBookings);
  };
  
  const handleGoToChat = () => {
    if (selectedRouteForView) {
        router.push(`/chat/${selectedRouteForView.id}`);
        setIsViewDialogOpen(false);
    } else {
        toast({ title: "Error", description: "Could not find the selected route to open chat.", variant: "destructive"});
    }
  }

  const handleSendSummaryToDriver = () => {
    if (!selectedRouteForView || !selectedRouteForView.driverMobile) {
      toast({ title: "Driver mobile not found.", variant: "destructive" });
      return;
    }
    if (bookingsForRoute.length === 0) {
      toast({ title: "No passengers to report.", variant: "destructive" });
      return;
    }
    
    const confirmedBookings = bookingsForRoute.filter(b => b.status === 'Confirmed');
    if (confirmedBookings.length === 0) {
      toast({ title: "No confirmed bookings to send.", variant: "destructive" });
      return;
    }

    const bookingDate = new Date(selectedRouteForView.travelDate);
    const formattedDate = format(bookingDate, 'dd MMM, yyyy');
    
    let summary = `*Passenger Summary for ${selectedRouteForView.fromLocation} to ${selectedRouteForView.toLocation}*\n`;
    summary += `*Date:* ${formattedDate} at ${selectedRouteForView.departureTime}\n\n`;

    confirmedBookings.forEach((booking, index) => {
      summary += `*${index + 1}. ${booking.client}*\n`;
      summary += `   - Seats: ${booking.travelers}\n`;
      summary += `   - Mobile: ${booking.mobile}\n\n`;
    });
    
    const totalPassengers = confirmedBookings.reduce((sum, b) => sum + (Number(b.travelers) || 1), 0);
    summary += `*Total Confirmed Passengers:* ${totalPassengers}`;
    
    const whatsappUrl = `https://wa.me/91${selectedRouteForView.driverMobile}?text=${encodeURIComponent(summary)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <AlertDialog open={showProfilePrompt}>
          <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Complete Your Profile</AlertDialogTitle>
              <AlertDialogDescription>
              Please complete your profile details, including vehicle information, before adding a route. This helps passengers know who they are traveling with.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogAction onClick={() => onSwitchTab('profile')}>
              Go to Profile
              </AlertDialogAction>
          </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
          <DialogContent>
          <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-yellow-500" />
              Promote Your Ride?
              </DialogTitle>
              <DialogDescription>
              Promote your ride for ₹100. Promoted rides are highlighted to attract more passengers.
              </DialogDescription>
          </DialogHeader>
          <div className="pt-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">Here's how your promoted ride will look:</p>
                  <Card className="overflow-hidden border-yellow-400 border-2 bg-yellow-50/50 dark:bg-yellow-900/10">
                      <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                              <div className="flex gap-4">
                                  <div>
                                      <div className="font-semibold">{routeDataToSubmit?.departureTime}</div>
                                      <div className="text-sm text-muted-foreground">{getTravelDuration(routeDataToSubmit?.departureTime, routeDataToSubmit?.arrivalTime)}</div>
                                      <div className="font-semibold mt-2">{routeDataToSubmit?.arrivalTime}</div>
                                  </div>
                                  <div className="flex flex-col items-center">
                                  <div className="w-3 h-3 rounded-full border-2 border-primary"></div>
                                  <div className="w-px h-10 bg-border my-1"></div>
                                  <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary"></div>
                                  </div>
                                  <div>
                                      <div className="font-semibold">{routeDataToSubmit?.fromLocation}</div>
                                      <div className="text-sm text-muted-foreground">{routeDataToSubmit?.distance ? routeDataToSubmit.distance.toFixed(0) : 0} km</div>
                                      <div className="font-semibold mt-2">{routeDataToSubmit?.toLocation}</div>
                                  </div>
                              </div>
                              <div className="text-right">
                              <div className="text-lg font-bold">
                                  ₹{routeDataToSubmit?.price.toFixed(2)}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center justify-end gap-1 mt-1">
                                  <Users className="h-4 w-4" />
                                  <span>{routeDataToSubmit?.availableSeats} seats left</span>
                              </div>
                              </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                              <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 border-yellow-300">
                                  <Sparkles className="mr-1 h-3 w-3" />
                                  Promoted
                              </Badge>
                          </div>
                      </CardContent>
                      <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                  <AvatarImage src={profile?.selfieDataUrl} />
                                  <AvatarFallback>{profile?.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                  <div className="font-semibold text-sm">{routeDataToSubmit?.driverName}</div>
                                  <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                      <span className="text-xs text-muted-foreground">{routeDataToSubmit?.rating.toFixed(1)}</span>
                                  </div>
                              </div>
                          </div>
                           <div className="text-right flex items-center gap-2">
                                <div>
                                    <div className="text-xs font-medium">{routeDataToSubmit?.vehicleType}</div>
                                    <div className="text-xs text-muted-foreground">{routeDataToSubmit?.vehicleNumber}</div>
                                </div>
                                {routeDataToSubmit?.vehicleType === 'Bike' ? (
                                    <Bike className="text-muted-foreground h-5 w-5" />
                                ) : (
                                    <Car className="text-muted-foreground h-5 w-5" />
                                )}
                            </div>
                      </CardFooter>
                  </Card>
              </div>
          <DialogFooter>
              <DialogClose asChild>
                  <Button variant="ghost" onClick={() => handlePromotionChoice(false)}>No, Thanks</Button>
              </DialogClose>
              <Button onClick={() => handlePromotionChoice(true)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Yes, Pay ₹100 to Promote
              </Button>
          </DialogFooter>
          </DialogContent>
      </Dialog>
      
      <PaymentDialog 
          isOpen={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          onPaymentSuccess={handlePaymentSuccess}
          amount="100.00"
          title="Promote Ride"
          description="This one-time fee of ₹100 will feature your ride at the top of search results."
      />
      
      <Card className="shadow-sm">
          <CardHeader>
          <CardTitle>Add a New Route</CardTitle>
          </CardHeader>
          <CardContent>
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="hidden md:block space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="ownerName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Owner Name</FormLabel>
                        <FormControl>
                            <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Enter owner's name" {...field} className="pl-10" disabled />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="driverName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Driver Name</FormLabel>
                        <FormControl>
                            <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Enter driver's name" {...field} className="pl-10" />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="driverMobile"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Driver Mobile</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input type="tel" placeholder="Enter driver's mobile" {...field} className="pl-10" />
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="fromLocation"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>From</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <LocationAutocompleteInput
                                        field={field}
                                        placeholder="Starting point"
                                    />
                                </FormControl>
                                <Button type="button" variant="outline" size="icon" onClick={handleUseCurrentLocation} disabled={isGettingLocation}>
                                    {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                                    <span className="sr-only">Use current location</span>
                                </Button>
                              </div>
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
                                <LocationAutocompleteInput
                                      field={field}
                                      placeholder="Destination"
                                  />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
              
              <div className="grid grid-cols-2 gap-4 items-end">
                 <FormField
                    control={form.control}
                    name="travelDate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Travel Date</FormLabel>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "MMM dd, yyyy")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                    if (date) field.onChange(date);
                                    setIsCalendarOpen(false)
                                }}
                                fromDate={new Date()}
                                toDate={addDays(new Date(), 30)}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <Select
                            onValueChange={(value) => {
                                field.onChange(value);
                                if (value === 'Bike') {
                                    form.setValue('availableSeats', 1);
                                }
                            }}
                            defaultValue={field.value}
                        >
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Car">Car</SelectItem>
                            <SelectItem value="Bike">Bike</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="departureTime"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Dep Time</FormLabel>
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

              <div className="grid grid-cols-2 gap-4">
                  <FormField
                  control={form.control}
                  name="availableSeats"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Available Seats</FormLabel>
                      <FormControl>
                          <div className="relative">
                          <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="number" placeholder="Number of seats" {...field} className="pl-10" disabled={vehicleType === 'Bike'} />
                          </div>
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
                          <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="number" placeholder="e.g., 500" {...field} className="pl-10" />
                          </div>
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
              </div>

              <Button type="submit" className="w-full">
                  Add Route
              </Button>
              </form>
          </Form>
          </CardContent>
      </Card>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Today's Routes</h2>
        {isTodaysRoutesLoading ? (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : todaysRoutes.length > 0 ? (
            <div className="space-y-4">
                {todaysRoutes.map((route) => {
                    const bookedSeats = bookedSeatsMap.get(route.id) || 0;
                    const availableSeats = route.availableSeats - bookedSeats;
                    const views = routeViewsMap.get(route.id) || 0;
                    
                    return (
                       <Card key={route.id} className={cn("overflow-hidden transition-all", route.isPromoted && "border-yellow-400 border-2 bg-yellow-50/50 dark:bg-yellow-900/10")}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div>
                                            <div className="font-semibold">{route.departureTime}</div>
                                            <div className="text-sm text-muted-foreground">{getTravelDuration(route.departureTime, route.arrivalTime)}</div>
                                            <div className="font-semibold mt-2">{route.arrivalTime}</div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full border-2 border-primary"></div>
                                            <div className="w-px h-10 bg-border my-1"></div>
                                            <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary"></div>
                                        </div>
                                        <div>
                                            <div className="font-semibold">{route.fromLocation}</div>
                                            <div className="text-sm text-muted-foreground">{format(new Date(route.travelDate), "PPP")}</div>
                                            {route.distance && (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1 my-1">
                                                    <Milestone className="h-3 w-3" />
                                                    <span>{route.distance.toFixed(0)} km</span>
                                                </div>
                                            )}
                                            <div className="font-semibold mt-2">{route.toLocation}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold">
                                            ₹{(route.price || 0).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center justify-end gap-1 mt-1">
                                            <Users className="h-4 w-4" />
                                            <span>{availableSeats > 0 ? `${availableSeats} seat${availableSeats > 1 ? 's' : ''} left` : 'Sold out'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-between mt-3 gap-2">
                                     <div className="flex flex-wrap gap-2">
                                        {route.isPromoted && (
                                            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 border-yellow-300">
                                                <Sparkles className="mr-1 h-3 w-3" />
                                                Promoted
                                            </Badge>
                                        )}
                                    </div>
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Eye className="h-4 w-4" />
                                        <span>{views} views</span>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={profile.selfieDataUrl} />
                                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-sm">{route.driverName}</div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="text-xs text-muted-foreground">{(route.rating || 0).toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button size="sm" onClick={() => handleViewBookings(route)}>
                                    View Bookings
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        ) : (
             <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl font-semibold">No Routes for Today</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        You have not added any routes for today. Add one using the form above.
                    </p>
                </CardContent>
            </Card>
        )}
      </div>
      
        {/* View Bookings Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bookings for {selectedRouteForView?.fromLocation} to {selectedRouteForView?.toLocation}</DialogTitle>
                <DialogDescription>
                  {selectedRouteForView && format(new Date(selectedRouteForView.travelDate), "PPP")} at {selectedRouteForView?.departureTime}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {bookingsForRoute.length > 0 ? (
                  bookingsForRoute.map(booking => (
                    <div key={booking.id} className="border p-3 rounded-md space-y-2">
                       <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{booking.client}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.mobile}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-muted-foreground" />
                           <span>{booking.travelers} Traveler(s)</span>
                       </div>
                    </div>
                  ))
                ) : (
                  <p>No bookings for this route yet.</p>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row sm:justify-between w-full">
                     <Button variant="outline" onClick={handleGoToChat}>
                        <MessagesSquare className="mr-2 h-4 w-4" />
                        Group Chat
                    </Button>
                    <Button variant="secondary" onClick={handleSendSummaryToDriver}>
                        <Car className="mr-2 h-4 w-4" />
                        Send Summary to Driver
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
