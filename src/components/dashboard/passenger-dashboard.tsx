
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Car, Star, Zap } from "lucide-react";
import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Route } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";


const searchFormSchema = z.object({
  fromLocation: z.string().min(2, "Starting location is required."),
  toLocation: z.string().min(2, "Destination is required."),
  travelDate: z.date({
    required_error: "A travel date is required.",
  }),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

interface PassengerDashboardProps {
  routes: Route[];
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

export default function PassengerDashboard({ routes }: PassengerDashboardProps) {
  const [availableOwners, setAvailableOwners] = useState<Route[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      fromLocation: "",
      toLocation: "",
    },
  });

  function onSubmit(data: SearchFormValues) {
    const searchDateStr = format(data.travelDate, "yyyy-MM-dd");
    
    const results = routes.filter(route => {
        const routeDateStr = format(new Date(route.travelDate), "yyyy-MM-dd");

        const fromMatch = route.fromLocation.trim().toLowerCase() === data.fromLocation.trim().toLowerCase();
        const toMatch = route.toLocation.trim().toLowerCase() === data.toLocation.trim().toLowerCase();
        const dateMatch = searchDateStr === routeDateStr;
        
        return fromMatch && toMatch && dateMatch;
    });

    setAvailableOwners(results);

    if (results.length === 0) {
        toast({
            title: "No Routes Found",
            description: "No owners are currently serving this route on the selected date.",
            variant: "destructive",
        });
    }
  }

  return (
    <div className="space-y-6">
        <Card className="shadow-sm mt-6">
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

        {availableOwners.length > 0 && (
          <div className="space-y-4">
              <h2 className="text-xl font-bold">Available Rides</h2>
              {availableOwners.map((route) => (
                  <Card key={route.id} className="overflow-hidden">
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
                                      <div className="font-semibold mt-8">{route.toLocation}</div>
                                  </div>
                              </div>
                              <div className="text-lg font-bold text-right">
                                ₹{(route.price || 0).toFixed(2)}
                              </div>
                          </div>
                      </CardContent>
                      <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                              <Car className="text-muted-foreground" />
                              <Avatar className="h-8 w-8">
                                  <AvatarImage src={`https://ui-avatars.com/api/?name=${route.driverName.replace(' ', '+')}&background=random`} />
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
                          <Button size="sm" onClick={() => router.push(`/book/${route.id}`)}>
                            <Zap className="mr-2 h-4 w-4" />
                            Book Now
                          </Button>
                      </CardFooter>
                  </Card>
              ))}
          </div>
        )}
    </div>
  );
}
