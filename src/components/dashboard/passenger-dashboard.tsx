
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapPin, Search, Loader2, LocateFixed, Hand, Plane, Users, ChevronRight, Car, Star, Milestone, ArrowRight, Bike, User, Phone, Shield, MessagesSquare } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, isToday } from "date-fns";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import type { Profile, Booking, Route } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getMapSuggestions, reverseGeocode } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { getCurrentUser, onBookingsUpdate, getRoutes, getProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "../ui/badge";
import { CheckCircle } from "lucide-react";


const searchFormSchema = z.object({
  fromLocation: z.string().min(2, "Starting location is required."),
  toLocation: z.string().min(2, "Destination is required."),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

interface PassengerDashboardProps {
  onSwitchTab: (tab: string) => void;
  profile: Profile | null;
}

const NavLink = ({ href, icon: Icon, title, description }: { href: string, icon: React.ElementType, title: string, description: string }) => (
    <Link href={href} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
            <Icon className="h-6 w-6 text-muted-foreground" />
            <div>
                <h4 className="font-medium">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
);


const LocationAutocompleteInput = ({
    field,
    placeholder,
    id,
}: {
    field: any;
    placeholder: string;
    id: string;
}) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchSuggestions = useCallback(async (query: string) => {
        setSuggestions([]); // Clear previous suggestions
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

    const handleSuggestionClick = (suggestion: any) => {
        field.onChange(suggestion.placeName);
        setSuggestions([]);
        setIsFocused(false);
    };

    return (
        <div className="relative">
            <div className="relative">
                 <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    {...field}
                    id={id}
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
                                key={`${suggestion.eLoc}-${index}`}
                                className="p-2 hover:bg-muted cursor-pointer"
                                onMouseDown={() => handleSuggestionClick(suggestion)}
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

const getTravelDuration = (departureTime: string, arrivalTime: string): string => {
    try {
        const departure = new Date(`1970-01-01T${departureTime}:00`);
        const arrival = new Date(`1970-01-01T${arrivalTime}:00`);
        const diffMinutes = (arrival.getTime() - departure.getTime()) / (1000 * 60);
        if (diffMinutes < 0) return "";

        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        
        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;

    } catch (e) {
        return "";
    }
}


export default function PassengerDashboard({ onSwitchTab, profile }: PassengerDashboardProps) {
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [todaysBookings, setTodaysBookings] = useState<Booking[]>([]);
  const [isTodaysBookingsLoading, setIsTodaysBookingsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<{route: Route | undefined, ownerProfile: Profile | undefined}>({ route: undefined, ownerProfile: undefined });

  const handleTodaysDataUpdate = useCallback((allUserBookings: Booking[]) => {
    const today = new Date();
    const filtered = allUserBookings.filter(b => 
        isToday(new Date(b.departureDate)) && 
        b.status !== 'Cancelled'
    );
    filtered.sort((a,b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
    setTodaysBookings(filtered);
    if(isTodaysBookingsLoading) setIsTodaysBookingsLoading(false);
  }, [isTodaysBookingsLoading]);

  useEffect(() => {
    if (profile === null || !profile.mobile || profile.mobile === '0000000000') {
      setShowProfilePrompt(true);
    }
    const locationPromptDismissed = localStorage.getItem('locationPromptDismissed');
    if (!locationPromptDismissed) {
      setShowLocationPrompt(true);
    }

    const userEmail = getCurrentUser();
    if (!userEmail || !profile) {
        setIsTodaysBookingsLoading(false);
        return;
    }
    
    // This now only runs once on mount because handleTodaysDataUpdate is stable
    const unsubscribe = onBookingsUpdate(handleTodaysDataUpdate, { userEmail, role: 'passenger' });

    return () => unsubscribe();

  }, [profile, handleTodaysDataUpdate]);
  
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      fromLocation: "",
      toLocation: "",
    },
  });

  useEffect(() => {
    const lastFrom = localStorage.getItem('lastSearchFrom');
    const lastTo = localStorage.getItem('lastSearchTo');
    if (lastFrom) {
        form.setValue('fromLocation', lastFrom);
    }
    if (lastTo) {
        form.setValue('toLocation', lastTo);
    }
  }, [form]);

  const handleUseCurrentLocation = async (isInitialPrompt = false) => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation is not supported by your browser.", variant: "destructive" });
      return;
    }
    
    if (isInitialPrompt) {
      setShowLocationPrompt(false);
      localStorage.setItem('locationPromptDismissed', 'true');
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
  
  function onSubmit(data: SearchFormValues) {
    setIsSearching(true);
    // Save the search to localStorage
    localStorage.setItem('lastSearchFrom', data.fromLocation);
    localStorage.setItem('lastSearchTo', data.toLocation);
    
    const params = new URLSearchParams({
        from: data.fromLocation,
        to: data.toLocation,
    });
    router.push(`/find-ride?${params.toString()}`);
  }

  const handleViewClick = async (booking: Booking) => {
    setSelectedBooking(booking);
    
    const bookingDateStr = format(new Date(booking.departureDate), 'yyyy-MM-dd');
    const [routeData, ownerProfileData] = await Promise.all([
        getRoutes(true, { date: bookingDateStr, from: booking.destination.split(' to ')[0], to: booking.destination.split(' to ')[1] }),
        getProfile(booking.ownerEmail),
    ]);
    
    const bookingTime = format(new Date(booking.departureDate), 'HH:mm');
    const route = routeData.find(r => r.departureTime === bookingTime);

    setSelectedBookingDetails({ route, ownerProfile: ownerProfileData });
    setIsViewOpen(true);
  };

  const handleGoToChat = () => {
    if (selectedBooking && selectedBooking.routeId) {
        router.push(`/chat/${selectedBooking.routeId}`);
        setIsViewOpen(false);
    } else {
        toast({ title: "Error", description: "Could not find the route ID for this booking to open chat.", variant: "destructive"});
    }
  }

  return (
    <div className="space-y-6">
      <AlertDialog open={showProfilePrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Please complete your profile details before searching for a ride. It helps owners know who they are traveling with.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => onSwitchTab('profile')}>
              Go to Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showLocationPrompt && (
        <Alert>
          <Hand className="h-4 w-4" />
          <AlertTitle>Get Better Suggestions!</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p>Allow location access to get ride suggestions from your current area.</p>
            <div className="flex gap-2 flex-shrink-0">
               <Button onClick={() => handleUseCurrentLocation(true)} size="sm">Allow Access</Button>
               <Button onClick={() => {
                   setShowLocationPrompt(false);
                   localStorage.setItem('locationPromptDismissed', 'true');
               }} variant="ghost" size="sm">Dismiss</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {todaysBookings.length === 0 && (
      <Card className="shadow-sm">
          <CardHeader>
              <CardTitle>Find a Ride</CardTitle>
          </CardHeader>
          <CardContent>
              <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-4">
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
                                      id={useFormField().id}
                                  />
                                </FormControl>
                                <Button type="button" variant="outline" size="icon" onClick={() => handleUseCurrentLocation()} disabled={isGettingLocation}>
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
                                    id={useFormField().id}
                                  />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                  </div>
                   <Button type="submit" className="w-full" disabled={isSearching}>
                      {isSearching ? (
                          <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Searching...
                          </>
                      ) : (
                          <>
                              <Search className="mr-2 h-4 w-4" />
                              Search Rides
                          </>
                      )}
                  </Button>
              </form>
              </Form>
          </CardContent>
      </Card>
      )}

      <div className="mt-8">
        <CardHeader className="px-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Bookings</CardTitle>
              <CardDescription>Your upcoming rides for today.</CardDescription>
            </div>
             <Link href="/bookings">
                <Button variant="outline">
                    View All Bookings <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </div>
        </CardHeader>
        
        {isTodaysBookingsLoading ? (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : todaysBookings.length > 0 ? (
            <div className="space-y-4">
                {todaysBookings.map((booking) => {
                    const [from, to] = booking.destination.split(' to ');
                    const departureTime = format(new Date(booking.departureDate), 'HH:mm');

                    return (
                       <Card key={booking.id} className="overflow-hidden transition-all">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div>
                                            <div className="font-semibold">{departureTime}</div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full border-2 border-primary"></div>
                                            <div className="w-px h-10 bg-border my-1"></div>
                                            <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary"></div>
                                        </div>
                                        <div>
                                            <div className="font-semibold">{from}</div>
                                            <div className="text-sm text-muted-foreground">{format(new Date(booking.departureDate), "PPP")}</div>
                                            {booking.distance && (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1 my-1">
                                                    <Milestone className="h-3 w-3" />
                                                    <span>{booking.distance.toFixed(0)} km</span>
                                                </div>
                                            )}
                                            <div className="font-semibold mt-2">{to}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold">
                                            ₹{(booking.amount || 0).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center justify-end gap-1 mt-1">
                                            <Users className="h-4 w-4" />
                                            <span>{booking.travelers} seat(s)</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                   {booking.vehicleType === 'Bike' ? (
                                        <Bike className="text-muted-foreground h-5 w-5" />
                                    ) : (
                                        <Car className="text-muted-foreground h-5 w-5" />
                                    )}
                                    <p className="text-sm font-medium">{booking.ownerName}</p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleViewClick(booking)}>View Details</Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        ) : (
             <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl font-semibold">No Rides Today</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        You have no rides scheduled for today. Use the form above to find one!
                    </p>
                </CardContent>
            </Card>
        )}
      </div>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        {selectedBooking && (
                <DialogContent className="max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Details for booking {selectedBooking.bookingCode || selectedBooking.id}</DialogTitle>
                        <DialogDescription>
                        Owner and vehicle information for your trip.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Owner</p>
                                    <p className="font-medium">{selectedBooking.ownerName || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Owner Mobile</p>
                                     <div className="flex items-center gap-1 flex-wrap">
                                        <p className="font-medium">{selectedBooking.ownerMobile}</p>
                                        {selectedBookingDetails.ownerProfile?.mobileVerified && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                                <CheckCircle className="h-3 w-3 mr-1" /> Verified
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Car className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Vehicle Type</p>
                                    <p className="font-medium">{selectedBooking.vehicleType || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Vehicle Number</p>
                                    <p className="font-medium">{selectedBooking.vehicleNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-auto pt-4 border-t flex flex-wrap justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                        {selectedBooking.ownerMobile && (
                            <a href={`tel:${selectedBooking.ownerMobile}`}>
                                <Button variant="outline">
                                    <Phone className="mr-2 h-4 w-4" />
                                    Call Owner
                                </Button>
                            </a>
                        )}
                        <Button onClick={handleGoToChat}>
                            <MessagesSquare className="mr-2 h-4 w-4" />
                            Group Chat
                        </Button>
                    </DialogFooter>
                </DialogContent>
        )}
        </Dialog>

    </div>
  );
}
