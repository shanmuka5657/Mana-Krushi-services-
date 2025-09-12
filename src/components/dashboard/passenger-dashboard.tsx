
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, IndianRupee, Car, Star, Users, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getProfile, getRoutes, getBookings } from "@/lib/storage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Route, Booking } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";


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

function FeaturedRides({ routes }: { routes: Route[] }) {
  const router = useRouter();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  useEffect(() => {
    getBookings(true).then(setAllBookings);
  }, []);

  if (!routes || routes.length === 0) {
    return null;
  }
  
  const getBookedSeats = (route: Route, allBookings: Booking[]) => {
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
  
  // Show the 5 most recent promoted rides
  const featured = routes
    .filter(r => r.isPromoted)
    .sort((a, b) => new Date(b.travelDate).getTime() - new Date(a.travelDate).getTime())
    .slice(0, 5);
  
  if (featured.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Featured Rides</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {featured.map((route) => {
             const bookedSeats = getBookedSeats(route, allBookings);
             const availableSeats = route.availableSeats - bookedSeats;
             const isPast = new Date(route.travelDate) < new Date();

            return (
              <CarouselItem key={route.id} className="basis-full md:basis-1/2 lg:basis-1/3">
                 <Card className="overflow-hidden h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="truncate">{route.fromLocation} to {route.toLocation}</CardTitle>
                        <CardDescription>{format(new Date(route.travelDate), "PPP")}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-lg">{route.departureTime}</p>
                                <p className="text-sm text-muted-foreground">{route.fromLocation}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-lg">{route.arrivalTime}</p>
                                <p className="text-sm text-muted-foreground">{route.toLocation}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-4 text-sm">
                             <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{availableSeats > 0 ? `${availableSeats} left` : 'Sold out'}</span>
                            </div>
                            <p className="font-bold text-lg">₹{route.price.toFixed(2)}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                       <div className="flex items-center gap-3">
                           <Avatar className="h-8 w-8">
                               <AvatarImage src={`https://ui-avatars.com/api/?name=${route.driverName.replace(' ', '+')}&background=random`} />
                               <AvatarFallback>{route.driverName.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div>
                               <div className="font-semibold text-sm">{route.driverName}</div>
                               <div className="flex items-center gap-1">
                                   <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                   <span className="text-xs text-muted-foreground">{route.rating.toFixed(1)}</span>
                               </div>
                           </div>
                       </div>
                        {availableSeats > 0 && !isPast && (
                          <Button size="sm" onClick={() => router.push(`/book/${route.id}`)}>
                            <Zap className="mr-2 h-4 w-4" /> Book
                          </Button>
                        )}
                    </CardFooter>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
}


export default function PassengerDashboard({ onSwitchTab }: PassengerDashboardProps) {
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkProfileAndFetchData = async () => {
        const profile = await getProfile();
        // A mobile number of '0000000000' is a dummy number, so we treat it as incomplete.
        if (!profile || !profile.mobile || profile.mobile === '0000000000') {
          setShowProfilePrompt(true);
        }
        
        const allRoutes = await getRoutes(true); // Fetch all routes for featured
        setRoutes(allRoutes);
    };
    checkProfileAndFetchData();
  }, []);
  
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      fromLocation: "",
      toLocation: "",
    },
  });
  
  function onSubmit(data: SearchFormValues) {
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

        <FeaturedRides routes={routes} />
        
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Your Next Adventure Awaits!</h2>
            <p className="text-muted-foreground">Find a ride with trusted owners.</p>
        </div>

        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Find a Ride</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                                <Popover>
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
                                        format(field.value, "PPP")
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
                                    onSelect={field.onChange}
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
                    <Button type="submit" className="w-full md:w-auto">Search</Button>
                </form>
                </Form>
            </CardContent>
        </Card>
        <BajajBanner />
    </div>
  );
}
