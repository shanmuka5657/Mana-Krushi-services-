
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, IndianRupee } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getProfile } from "@/lib/storage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


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
  const router = useRouter();

  useEffect(() => {
    const checkProfileAndFetchBookings = async () => {
        const profile = await getProfile();
        // A mobile number of '0000000000' is a dummy number, so we treat it as incomplete.
        if (!profile || !profile.mobile || profile.mobile === '0000000000') {
          setShowProfilePrompt(true);
        }
    };
    checkProfileAndFetchBookings();
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

        <div className="text-center">
            <Image 
                src="https://i.ibb.co/3mhxDmsz/file-00000000c09861fabb32183eb613ae2b.png" 
                alt="Find a ride"
                width={691}
                height={225}
                className="rounded-lg object-contain w-full h-auto"
                data-ai-hint="road trip"
            />
            <h2 className="text-2xl font-bold text-gray-800">Your Next Adventure Awaits!</h2>
            <p className="text-muted-foreground">Find a ride with trusted owners.</p>
        </div>

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
        <BajajBanner />
    </div>
  );
}
