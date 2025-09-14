

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, MapPin, IndianRupee, Search, Loader2, User, Star, Users, Zap, Car, Sparkles, Milestone, Shield, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getProfile, getRoutes, getBookings, getAllProfiles } from "@/lib/storage";
import type { Route, Booking, Profile } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";


const searchFormSchema = z.object({
  fromLocation: z.string().min(2, "Starting location is required."),
  toLocation: z.string().min(2, "Destination is required."),
  travelDate: z.date({
    required_error: "A travel date is required.",
  }),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

interface PassengerDashboardProps {
  onSwitchTab: (tab: string) => void;
}

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

function TopMembers() {
    const [topRoutes, setTopRoutes] = useState<Route[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const router = useRouter();
    const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));
    
    useEffect(() => {
        const fetchTopRoutes = async () => {
            const [allRoutes, bookings, profiles] = await Promise.all([
                getRoutes(true),
                getBookings(true),
                getAllProfiles(),
            ]);
            setAllBookings(bookings);
            setAllProfiles(profiles);
            
            const today = new Date(currentDate);
            today.setHours(0, 0, 0, 0);

            const filteredRoutes = allRoutes.filter(route => {
                const routeDate = new Date(route.travelDate);
                routeDate.setHours(0, 0, 0, 0);
                
                if (routeDate.getTime() !== today.getTime()) {
                    return false;
                }

                const [hours, minutes] = route.departureTime.split(':').map(Number);
                const departureDateTime = new Date(route.travelDate);
                departureDateTime.setHours(hours, minutes);

                return departureDateTime > new Date();
            });

            const sortedRoutes = [...filteredRoutes].sort((a, b) => {
                if (a.isPromoted && !b.isPromoted) return -1;
                if (!a.isPromoted && b.isPromoted) return 1;
                return (b.rating || 0) - (a.rating || 0);
            });
            setTopRoutes(sortedRoutes.slice(0, 5));
        }
        fetchTopRoutes();
    }, [currentDate]);
    
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
       }).reduce((acc, b) => acc + (Number(b.travelers) || 1), 0);
     }
     
    const getDriverProfile = (ownerEmail: string): Profile | undefined => {
        return allProfiles.find(p => p.email === ownerEmail);
    }


    if (topRoutes.length === 0) {
        return (
             <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Top Members</CardTitle>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[180px] justify-start text-left font-normal",
                            !currentDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {currentDate ? format(currentDate, "dd MMM") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={currentDate}
                          onSelect={(date) => {
                            if (date) {
                                setCurrentDate(date);
                            }
                            setIsCalendarOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-muted-foreground">
                        <p>No upcoming rides found for today.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Top Members</CardTitle>
                    <CardDescription>Highest rated rides for today.</CardDescription>
                </div>
                 <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-[180px] justify-start text-left font-normal",
                        !currentDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentDate ? format(currentDate, "dd MMM") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={currentDate}
                        onSelect={(date) => {
                            if (date) {
                                setCurrentDate(date);
                            }
                            setIsCalendarOpen(false);
                        }}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent>
                <Carousel
                    plugins={[plugin.current]}
                    className="w-full"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                >
                 <CarouselContent>
                 {topRoutes.map(route => {
                    const bookedSeats = getBookedSeats(route);
                    const availableSeats = route.availableSeats - bookedSeats;
                    const driverProfile = getDriverProfile(route.ownerEmail);
                    return (
                        <CarouselItem key={route.id}>
                            <Card className={cn("overflow-hidden transition-all", route.isPromoted && "border-yellow-400 border-2 bg-yellow-50/50 dark:bg-yellow-900/10")}>
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
                                                <span>{availableSeats > 0 ? `${availableSeats} seats left` : 'Sold out'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {route.isPromoted && (
                                            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 border-yellow-300">
                                                <Sparkles className="mr-1 h-3 w-3" />
                                                Promoted
                                            </Badge>
                                        )}
                                        {route.isPromoted && (
                                            <Badge variant="secondary" className="bg-green-200 text-green-800 border-green-300">
                                                <Shield className="mr-1 h-3 w-3" />
                                                Insurance: Yes
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                                 <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={driverProfile?.selfieDataUrl || `https://ui-avatars.com/api/?name=${route.driverName.replace(' ', '+')}&background=random`} />
                                            <AvatarFallback>{route.driverName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow">
                                            <div className="font-semibold text-sm flex items-center gap-2">
                                                {route.driverName}
                                                {driverProfile?.mobileVerified && (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 p-1 h-4">
                                                        <CheckCircle className="h-3 w-3" />
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-xs text-muted-foreground">{(route.rating || 0).toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <div className="text-center ml-4">
                                            {route.vehicleType && <p className="text-xs font-medium text-muted-foreground">{route.vehicleType}</p>}
                                            <Car className="text-muted-foreground" />
                                        </div>
                                    </div>
                                    {availableSeats > 0 && (
                                    <Button size="sm" onClick={() => router.push(`/book/${route.id}`)}>
                                        Book
                                    </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </CarouselItem>
                    )
                })}
                </CarouselContent>
                </Carousel>
            </CardContent>
        </Card>
    );
}

function IndusIndBanner() {
    return (
        <a href="https://clnk.in/w6hk" target="_blank" rel="noopener noreferrer" className="block w-full group mb-6">
            <Card className="w-full overflow-hidden relative text-white bg-indigo-900 aspect-[4/1] md:aspect-[5/1]">
                 <Image 
                    src="https://picsum.photos/seed/indusind-loan/1200/240"
                    alt="IndusInd Bank Saving Account"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-20"
                    data-ai-hint="bank offer"
                />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg md:text-2xl font-bold">Open an IndusInd Saving Account</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-md">Get exclusive benefits with an IndusInd online saving account.</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-indigo-900 hover:bg-gray-100 text-xs md:text-sm">
                        Apply Now <IndianRupee className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </a>
    )
}

function BajajBanner() {
    return (
        <a href="https://clnk.in/w6hf" target="_blank" rel="noopener noreferrer" className="block w-full group mt-6">
            <Card className="w-full overflow-hidden relative text-white bg-blue-900 aspect-[4/1] md:aspect-[5/1]">
                 <Image 
                    src="https://picsum.photos/seed/bajaj-loan/1200/240"
                    alt="Bajaj Finserv Personal Loan"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-20"
                    data-ai-hint="finance loan"
                />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg md:text-2xl font-bold">Get a Personal Loan up to ₹40 Lakh</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-md">Bajaj Finserv offers instant approval and disbursal in 24 hours.</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-blue-900 hover:bg-gray-100 text-xs md:text-sm">
                        Apply Now <IndianRupee className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </a>
    )
}

export default function PassengerDashboard({ onSwitchTab }: PassengerDashboardProps) {
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
        const profile = await getProfile();
        if (!profile || !profile.mobile || profile.mobile === '0000000000') {
          setShowProfilePrompt(true);
        }
    }
    checkProfile();
  }, []);
  
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      fromLocation: "",
      toLocation: "",
      travelDate: new Date(),
    },
  });
  
  function onSubmit(data: SearchFormValues) {
    setIsSearching(true);
    const params = new URLSearchParams({
        from: data.fromLocation,
        to: data.toLocation,
        date: format(data.travelDate, 'yyyy-MM-dd')
    });
    router.push(`/find-ride?${params.toString()}`);
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

        <IndusIndBanner />

        <TopMembers />
        
        <Card className="shadow-sm mt-6">
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
                                <FormControl>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input placeholder="Starting location" {...field} className="pl-10" />
                                </div>
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
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input placeholder="Destination" {...field} className="pl-10" />
                                </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="travelDate"
                            render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
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
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? (
                                        format(field.value, "PPP")
                                        ) : (
                                        <span>Pick a date</span>
                                        )}
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                        field.onChange(date);
                                        setIsCalendarOpen(false);
                                    }}
                                    disabled={(date) =>
                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
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

        <BajajBanner />
    </div>
  );
}
