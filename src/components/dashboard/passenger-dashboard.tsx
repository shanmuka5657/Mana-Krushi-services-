

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Search, Loader2, Star, Users, Car, Sparkles, Shield, Milestone } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';

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
import { getProfile, getRoutes, getBookings, getAllProfiles } from "@/lib/storage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Route, Booking, Profile } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";


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

const TopMembersCarousel = () => {
    const [topRoutes, setTopRoutes] = useState<Route[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchTopMembers = async () => {
            // New efficient query: Get only promoted, upcoming routes, limited to 5
            const allRoutes = await getRoutes(true); // Still need a way to query efficiently
            const upcomingPromotedRoutes = allRoutes
                .filter(route => route.isPromoted && new Date(route.travelDate) >= new Date())
                .sort((a,b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime())
                .slice(0, 5);
            
            setTopRoutes(upcomingPromotedRoutes);

            // We only need profiles for the drivers of these few routes
            if (upcomingPromotedRoutes.length > 0) {
                const driverEmails = upcomingPromotedRoutes.map(r => r.ownerEmail);
                const uniqueDriverEmails = [...new Set(driverEmails)];
                const driverProfiles = await Promise.all(uniqueDriverEmails.map(email => getProfile(email)));
                setProfiles(driverProfiles.filter(p => p !== null) as Profile[]);
            }
        };
        fetchTopMembers();
    }, []);

    const getDriverProfile = (ownerEmail?: string): Profile | undefined => {
        if (!ownerEmail) return undefined;
        return profiles.find(p => p.email === ownerEmail);
    }
    
    if (topRoutes.length === 0) {
        return null; // Don't render if no top members
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-yellow-500" />
                    Top Rides
                </CardTitle>
                 <CardDescription>Featured rides from our top owners.</CardDescription>
            </CardHeader>
            <CardContent>
                <Carousel
                    opts={{ align: "start", loop: true }}
                    plugins={[Autoplay({ delay: 5000 })]}
                    className="w-full"
                >
                    <CarouselContent>
                        {topRoutes.map((route) => {
                             const driverProfile = getDriverProfile(route.ownerEmail);
                             return (
                                <CarouselItem key={route.id}>
                                    <Card className="overflow-hidden border-yellow-400 border-2 bg-yellow-50/50 dark:bg-yellow-900/10" onClick={() => router.push(`/book/${route.id}`)}>
                                        <CardContent className="p-4 cursor-pointer">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-lg">{route.fromLocation} to {route.toLocation}</p>
                                                    <p className="text-sm text-muted-foreground">{format(new Date(route.travelDate), "PPP")} at {route.departureTime}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-lg font-bold">
                                                        ₹{(route.price || 0).toFixed(2)}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">per seat</p>
                                                </div>
                                            </div>
                                             <div className="flex flex-wrap gap-2 mt-3">
                                                <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 border-yellow-300">
                                                    <Sparkles className="mr-1 h-3 w-3" />
                                                    Promoted
                                                </Badge>
                                                <Badge variant="secondary" className="bg-green-200 text-green-800 border-green-300">
                                                    <Shield className="mr-1 h-3 w-3" />
                                                    Insurance: Yes
                                                </Badge>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={driverProfile?.selfieDataUrl} />
                                                    <AvatarFallback>{route.driverName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-sm">{route.driverName}</div>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="text-xs text-muted-foreground">{(route.rating || 0).toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </div>
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
};


export default function PassengerDashboard({ onSwitchTab }: PassengerDashboardProps) {
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const checkProfile = async () => {
        const profile = await getProfile();
        if (!profile || !profile.mobile || profile.mobile === '0000000000') {
          setShowProfilePrompt(true);
        }
    }
    checkProfile();
  }, []);
  
  useEffect(() => {
    const fetchLocations = async () => {
      const allRoutes = await getRoutes(true);
      const allLocations = new Set<string>();
      allRoutes.forEach(route => {
        allLocations.add(route.fromLocation);
        allLocations.add(route.toLocation);
        route.pickupPoints?.forEach(p => allLocations.add(p));
        route.dropOffPoints?.forEach(d => allLocations.add(d));
      });
      setLocations(Array.from(allLocations));
    };
    fetchLocations();
  }, []);
  
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      fromLocation: "",
      toLocation: "",
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
                              <FormControl>
                              <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input placeholder="Starting location" {...field} className="pl-10" list="locations-list" />
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
                                  <Input placeholder="Destination" {...field} className="pl-10" list="locations-list" />
                              </div>
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <datalist id="locations-list">
                        {locations.map(loc => <option key={loc} value={loc} />)}
                      </datalist>
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
      
      <TopMembersCarousel />

    </div>
  );
}
