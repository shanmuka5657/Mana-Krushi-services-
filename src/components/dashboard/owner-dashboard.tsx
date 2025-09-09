
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Clock, User, Phone, Car, MapPin, Users, Calendar as CalendarIcon, DollarSign } from "lucide-react";
import { format, addMonths } from "date-fns";
import { useEffect, useState } from "react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { getProfile, saveProfile } from "@/lib/storage";
import PaymentDialog from "./payment-dialog";
import type { Profile } from "@/lib/types";


const ownerFormSchema = z.object({
  ownerName: z.string().min(2, "Owner name is required."),
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
  vehicleType: z.string().min(2, "Vehicle type is required."),
  price: z.coerce.number().positive("Price must be a positive number."),
  rating: z.coerce.number().min(1).max(5).default(Math.round((Math.random() * 2 + 3) * 10) / 10), // Random rating between 3 and 5
});

export type OwnerFormValues = z.infer<typeof ownerFormSchema>;

interface OwnerDashboardProps {
  onRouteAdded: (newRoute: OwnerFormValues) => void;
  onSwitchTab: (tab: string) => void;
}

export default function OwnerDashboard({ onRouteAdded, onSwitchTab }: OwnerDashboardProps) {
  const { toast } = useToast();
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [routeDataToSubmit, setRouteDataToSubmit] = useState<OwnerFormValues | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
        const userProfile = await getProfile();
        setProfile(userProfile);
        if (!userProfile || !userProfile.mobile || userProfile.mobile === '0000000000') {
          setShowProfilePrompt(true);
        }
    }
    checkProfile();
  }, []);

  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerFormSchema),
    defaultValues: {
        ownerName: "",
        driverName: "",
        driverMobile: "",
        fromLocation: "",
        toLocation: "",
        departureTime: "09:00",
        arrivalTime: "18:00",
        availableSeats: 1,
        vehicleType: "",
        price: 500,
        rating: 4.5,
    },
  });
  
  useEffect(() => {
    const loadProfile = async () => {
        const userProfile = await getProfile();
        if(userProfile?.name) {
            form.setValue('ownerName', userProfile.name);
            form.setValue('driverName', userProfile.name);
        }
         if(userProfile?.mobile && userProfile.mobile !== '0000000000') {
            form.setValue('driverMobile', userProfile.mobile);
        }
    }
    loadProfile();
  }, [form]);

  async function onSubmit(data: OwnerFormValues) {
    setRouteDataToSubmit(data);

    // Check if the user has an active plan
    const hasActivePlan = profile?.planExpiryDate && new Date(profile.planExpiryDate) > new Date();

    if (hasActivePlan) {
      // If they have a plan, add the route directly
      handleRouteSubmission(data);
    } else {
      // Otherwise, open the payment dialog
      setIsPaymentDialogOpen(true);
    }
  }

  const handleRouteSubmission = (data: OwnerFormValues) => {
     onRouteAdded(data);
      toast({
        title: "Route Added!",
        description: `Your route from ${data.fromLocation} to ${data.toLocation} has been added.`,
      });
      form.reset();
       // Reset form fields to their defaults after submission
       const profileName = form.getValues('ownerName');
       const profileMobile = form.getValues('driverMobile');
       form.reset({
        ownerName: profileName,
        driverName: profileName,
        driverMobile: profileMobile,
        fromLocation: "",
        toLocation: "",
        departureTime: "09:00",
        arrivalTime: "18:00",
        availableSeats: 1,
        vehicleType: "",
        price: 500,
        rating: 4.5
      });
      setRouteDataToSubmit(null);
  }
  
  const handlePaymentSuccess = async () => {
    if (routeDataToSubmit && profile) {
      // Update profile with new expiry date
      const newExpiryDate = addMonths(new Date(), 3);
      const updatedProfile: Profile = { ...profile, planExpiryDate: newExpiryDate };
      await saveProfile(updatedProfile);
      setProfile(updatedProfile); // Update local profile state
      
      // Now submit the route
      handleRouteSubmission(routeDataToSubmit);
    }
  }

  return (
    <>
      <AlertDialog open={showProfilePrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Please complete your profile details before adding a route. This helps passengers know who they are traveling with.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => onSwitchTab('profile')}>
              Go to Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <PaymentDialog 
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onPaymentSuccess={handlePaymentSuccess}
      />
      
      <Card className="shadow-sm mt-6">
        <CardHeader>
          <CardTitle>Add a New Route</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fromLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Starting point" {...field} className="pl-10" />
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
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="departureTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="time" className="pl-10" {...field} />
                        </div>
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
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="time" className="pl-10" {...field} />
                        </div>
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
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="number" placeholder="Number of seats" {...field} className="pl-10" />
                        </div>
                      </FormControl>
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
                      <FormControl>
                        <div className="relative">
                          <Car className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="e.g., Sedan, SUV" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Seat (₹)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="number" placeholder="e.g., 50" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Add Route
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
