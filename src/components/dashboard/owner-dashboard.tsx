

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Clock, User, Phone, Car, MapPin, Users, Calendar as CalendarIcon, DollarSign, Wand2, Loader2, Link2, Shield, IndianRupee, Sparkles, Star } from "lucide-react";
import { format, addMonths } from "date-fns";
import { useEffect, useState, useRef } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { getProfile, saveProfile, getCurrentUser } from "@/lib/storage";
import PaymentDialog from "./payment-dialog";
import type { Profile } from "@/lib/types";
import { calculateDistance } from "@/app/actions";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";


const ownerFormSchema = z.object({
  ownerName: z.string().min(2, "Owner name is required."),
  ownerEmail: z.string().email(),
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
  onRouteAdded: (newRoute: OwnerFormValues & { pickupPoints?: string[], dropOffPoints?: string[], isPromoted?: boolean }) => void;
  onSwitchTab: (tab: string) => void;
}

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
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [routeDataToSubmit, setRouteDataToSubmit] = useState<(OwnerFormValues & { isPromoted?: boolean }) | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
        } else if (!userProfile.planExpiryDate) {
             toast({
                title: "Owner Plan Inactive",
                description: "Please activate your owner plan in your profile to add routes.",
                variant: "destructive",
            });
            onSwitchTab('profile');
        }
    }
    checkProfile();
  }, [onSwitchTab, toast]);

  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerFormSchema),
    defaultValues: {
        ownerName: "",
        ownerEmail: "",
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
        if(userProfile?.email) {
            form.setValue('ownerEmail', userProfile.email);
        }
        if(userProfile) {
            setProfile(userProfile);
        }
    }
    loadProfile();
  }, [form]);

  async function onSubmit(data: OwnerFormValues) {
    const userProfile = await getProfile();
    if (!userProfile?.planExpiryDate) {
        toast({
            title: "Owner Plan Required",
            description: "Please activate your owner plan in your profile before adding a route.",
            variant: "destructive"
        });
        onSwitchTab('profile');
        return;
    }
    
    const ownerEmail = getCurrentUser();
    if(!ownerEmail) {
        toast({ title: "Error", description: "Could not identify current user. Please log in again.", variant: "destructive" });
        return;
    }

    const dataWithVehicleInfo = {
        ...data,
        ownerEmail: ownerEmail,
        vehicleType: userProfile.vehicleType,
        vehicleNumber: userProfile.vehicleNumber,
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

  const handleRouteSubmission = (data: OwnerFormValues & { isPromoted?: boolean }) => {
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
      const profileEmail = form.getValues('ownerEmail');

      form.reset({
        ownerName: profileName,
        driverName: profileName,
        driverMobile: profileMobile,
        ownerEmail: profileEmail,
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
  
  const handlePaymentSuccess = () => {
    if (routeDataToSubmit) {
      // ** REAL-WORLD INTEGRATION POINT **
      // An API call to the insurance provider (e.g., Acko) would be made here.
      // e.g., await generateInsuranceForRide(routeDataToSubmit);
      // The policy ID would be stored with the route.
      
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

      <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-yellow-500" />
              Promote Your Ride?
            </DialogTitle>
            <DialogDescription>
              Promote your ride for ₹100 to highlight it in search results and provide passengers with ride insurance.
            </DialogDescription>
          </DialogHeader>
           <div className="pt-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">Here's how your ride will look to passengers:</p>
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
                            <Badge variant="secondary" className="bg-green-200 text-green-800 border-green-300">
                                <Shield className="mr-1 h-3 w-3" />
                                Insurance: Yes
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
                         <div className="text-right">
                           <div className="text-xs font-medium">{profile?.vehicleType}</div>
                           <Car className="text-muted-foreground h-5 w-5 ml-auto" />
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
        title="Promote Ride & Add Insurance"
        description="This one-time fee of ₹100 will feature your ride at the top of search results and provide insurance coverage for this trip."
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
                            onSelect={(date) => {
                                field.onChange(date)
                                setIsCalendarOpen(false)
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
