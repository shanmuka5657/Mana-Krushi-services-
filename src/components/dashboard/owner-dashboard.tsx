
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Clock, User, Phone, Car, MapPin, Users, Calendar as CalendarIcon, DollarSign, Wand2, Loader2, Link2, Shield, IndianRupee } from "lucide-react";
import { format, addMonths } from "date-fns";
import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { calculateDistance } from "@/app/actions";


const ownerFormSchema = z.object({
  ownerName: z.string().min(2, "Owner name is required."),
  driverName: z.string().min(2, "Driver name is required."),
  driverMobile: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number."),
  fromLocation: z.string().min(2, "Starting location is required.").transform(val => val.trim()),
  toLocation: z.string().min(2, "Destination is required.").transform(val => val.trim()),
  distance: z.coerce.number().optional(),
  pickupPoints: z.string().optional(),
  dropOffPoints: z.string().optional(),
  travelDate: z.date({
    required_error: "A travel date is required.",
  }),
  departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  arrivalTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  availableSeats: z.coerce.number().int().positive("Available seats must be a positive number."),
  price: z.coerce.number().positive("Price must be a positive number."),
  rating: z.coerce.number().min(1).max(5).default(Math.round((Math.random() * 2 + 3) * 10) / 10), // Random rating between 3 and 5
  vehicleType: z.string().optional(),
  vehicleNumber: z.string().optional(),
});

export type OwnerFormValues = z.infer<typeof ownerFormSchema>;

interface OwnerDashboardProps {
  onRouteAdded: (newRoute: OwnerFormValues & { pickupPoints?: string[], dropOffPoints?: string[] }) => void;
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

export default function OwnerDashboard({ onRouteAdded, onSwitchTab }: OwnerDashboardProps) {
  const { toast } = useToast();
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeDataToSubmit, setRouteDataToSubmit] = useState<OwnerFormValues | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
        const userProfile = await getProfile();
        setProfile(userProfile);
        if (!userProfile || !userProfile.mobile || userProfile.mobile === '0000000000') {
          setShowProfilePrompt(true);
        } else if (!userProfile.vehicleType || !userProfile.vehicleNumber) {
            toast({
                title: "Vehicle Info Missing",
                description: "Please add your vehicle type and number in your profile.",
                variant: "destructive",
            });
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
        distance: 0,
        pickupPoints: "",
        dropOffPoints: "",
        departureTime: "09:00",
        arrivalTime: "18:00",
        availableSeats: 1,
        price: 500,
        rating: 4.5,
        vehicleType: "",
        vehicleNumber: "",
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
    // Make sure vehicle info is in the profile
    const userProfile = await getProfile();
    if (!userProfile || !userProfile.vehicleType || !userProfile.vehicleNumber) {
        toast({
            title: "Vehicle Information Required",
            description: "Please update your vehicle type and number in your profile before adding a route.",
            variant: "destructive"
        });
        onSwitchTab('profile');
        return;
    }
    
    const dataWithVehicleInfo = {
        ...data,
        vehicleType: userProfile.vehicleType,
        vehicleNumber: userProfile.vehicleNumber,
    };

    setRouteDataToSubmit(dataWithVehicleInfo);

    // Check if the user has an active plan
    const hasActivePlan = userProfile?.planExpiryDate && new Date(userProfile.planExpiryDate) > new Date();

    if (hasActivePlan) {
      // If they have a plan, add the route directly
      handleRouteSubmission(dataWithVehicleInfo);
    } else {
      // Otherwise, open the payment dialog
      setIsPaymentDialogOpen(true);
    }
  }
  
  const handleCalculateDistance = async () => {
      const from = form.getValues('fromLocation');
      const to = form.getValues('toLocation');

      if(!from || !to) {
          toast({
              title: "Locations required",
              description: "Please enter 'From' and 'To' locations to calculate distance.",
              variant: "destructive"
          });
          return;
      }
      setIsCalculating(true);
      const result = await calculateDistance({from, to});
      setIsCalculating(false);

      if (result.error) {
          toast({
              title: "Error Calculating Distance",
              description: result.error,
              variant: "destructive"
          });
      } else if (result.distance) {
          form.setValue('distance', result.distance);
           toast({
              title: "Distance Calculated",
              description: `The distance is approximately ${result.distance} km.`,
          });
      }
  }

  const handleRouteSubmission = (data: OwnerFormValues) => {
    const finalData = {
      ...data,
      pickupPoints: data.pickupPoints?.split('\n').map(p => p.trim()).filter(p => p) || [],
      dropOffPoints: data.dropOffPoints?.split('\n').map(p => p.trim()).filter(p => p) || []
    };

     onRouteAdded(finalData);
      toast({
        title: "Route Added!",
        description: `Your route from ${data.fromLocation} to ${data.toLocation} has been added.`,
      });
      
      const profileName = form.getValues('ownerName');
      const profileMobile = form.getValues('driverMobile');
      form.reset({
        ownerName: profileName,
        driverName: profileName,
        driverMobile: profileMobile,
        fromLocation: "",
        toLocation: "",
        distance: 0,
        pickupPoints: "",
        dropOffPoints: "",
        departureTime: "09:00",
        arrivalTime: "18:00",
        availableSeats: 1,
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
      
      <PaymentDialog 
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onPaymentSuccess={handlePaymentSuccess}
      />
      
      <IndusIndBanner />

      <Card className="shadow-sm">
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-end">
                <FormField
                  control={form.control}
                  name="fromLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Starting city" {...field} className="pl-10" />
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
                          <Input placeholder="Destination city" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
                   <FormField
                      control={form.control}
                      name="distance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance (km)</FormLabel>
                          <div className="flex gap-2">
                             <FormControl>
                                <div className="relative flex-grow">
                                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input type="number" placeholder="AI Calculated Distance" {...field} className="pl-10" readOnly />
                                </div>
                              </FormControl>
                             <Button type="button" variant="outline" onClick={handleCalculateDistance} disabled={isCalculating}>
                                {isCalculating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                                <span className="ml-2">Calculate</span>
                             </Button>
                          </div>
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
                          <Textarea 
                            placeholder="Enter each pickup point on a new line" 
                            className="h-24"
                            {...field}
                          />
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
                           <Textarea 
                              placeholder="Enter each drop-off point on a new line" 
                              className="h-24"
                              {...field}
                            />
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
      <BajajBanner />
    </>
  );
}
