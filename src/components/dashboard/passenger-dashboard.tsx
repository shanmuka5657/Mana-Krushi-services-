
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, IndianRupee, Search, Loader2, User, Star, Sparkles, Clock, Car } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
import { getProfile, getRoutes } from "@/lib/storage";
import type { Route } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


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

function FeaturedRides() {
  const [promotedRoutes, setPromotedRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPromotedRoutes = async () => {
      setIsLoading(true);
      const allRoutes = await getRoutes(true); // Fetch all routes
      const upcomingPromoted = allRoutes.filter(route => {
        const routeDate = new Date(route.travelDate);
        return route.isPromoted && routeDate >= new Date(new Date().setHours(0,0,0,0));
      });
      setPromotedRoutes(upcomingPromoted);
      setIsLoading(false);
    };

    fetchPromotedRoutes();
  }, []);

  if (isLoading) {
    return (
        <div className="space-y-4 mt-6">
            <h2 className="text-2xl font-bold tracking-tight">Featured Rides</h2>
            <div className="relative">
                <Carousel opts={{ align: "start" }} className="w-full">
                    <CarouselContent>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                               <Card className="w-full animate-pulse bg-muted">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="h-5 w-3/4 rounded bg-muted-foreground/20"></div>
                                        <div className="h-4 w-1/2 rounded bg-muted-foreground/20"></div>
                                        <div className="h-4 w-1/4 rounded bg-muted-foreground/20"></div>
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-muted-foreground/20"></div>
                                                <div className="h-5 w-20 rounded bg-muted-foreground/20"></div>
                                            </div>
                                            <div className="h-8 w-20 rounded-md bg-muted-foreground/20"></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </div>
    );
  }

  if (promotedRoutes.length === 0) {
    return null; // Don't render the section if there are no promoted rides
  }
  
  const handleRideClick = (rideId: string) => {
    router.push(`/book/${rideId}`);
  };

  return (
    <div className="space-y-4 mt-6">
      <h2 className="text-2xl font-bold tracking-tight">Featured Rides</h2>
      <div className="relative">
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent>
            {promotedRoutes.map((route) => (
              <CarouselItem key={route.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="w-full transition-all border-2 border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10 cursor-pointer hover:shadow-lg" onClick={() => handleRideClick(route.id)}>
                   <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                           <div>
                            <h3 className="font-bold text-lg">{route.fromLocation} → {route.toLocation}</h3>
                             <p className="text-sm text-muted-foreground">{format(new Date(route.travelDate), "EEE, dd MMM")} at {route.departureTime}</p>
                           </div>
                           <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 border-yellow-300">
                                <Sparkles className="mr-1 h-3 w-3" />
                                Promoted
                           </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${route.driverName.replace(' ', '+')}&background=random`} />
                                    <AvatarFallback>{route.driverName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">{route.driverName}</p>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-medium">{route.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                             <div className="text-right">
                                <p className="font-bold text-lg">₹{route.price.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">per seat</p>
                            </div>
                        </div>
                   </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          {promotedRoutes.length > 3 && (
            <>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden lg:flex" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden lg:flex" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
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

  useEffect(() => {
    const checkProfileAndFetchData = async () => {
        const profile = await getProfile();
        // A mobile number of '0000000000' is a dummy number, so we treat it as incomplete.
        if (!profile || !profile.mobile || profile.mobile === '0000000000') {
          setShowProfilePrompt(true);
        }
    };
    checkProfileAndFetchData();
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

        <div className="mb-6"></div>
        
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
        <FeaturedRides />
        <BajajBanner />
    </div>
  );
}
