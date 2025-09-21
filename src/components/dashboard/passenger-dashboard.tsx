
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getProfile, getRoutes } from "@/lib/storage";
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

    </div>
  );
}
