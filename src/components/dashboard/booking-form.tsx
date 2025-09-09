
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, setHours, setMinutes } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Sparkles, Clock } from "lucide-react";
import { useState } from "react";

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
import { suggestDestinations } from "@/app/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const bookingFormSchema = z.object({
  clientName: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  mobile: z
    .string()
    .min(10, { message: "Mobile number must be at least 10 digits." })
    .regex(/^\d+$/, { message: "Mobile number must contain only digits." }),
  destination: z.string().min(3, {
    message: "Destination must be at least 3 characters.",
  }),
  departureDate: z.date({
    required_error: "A departure date is required.",
  }),
  departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  returnDate: z.date({
    required_error: "A return date is required.",
  }),
  returnTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  travelers: z.string().nonempty("Number of travelers is required."),
  budget: z.coerce.number().positive({ message: "Please enter a valid budget." }),
  specialRequests: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  onBookingCreated: (data: BookingFormValues) => void;
}

export default function BookingForm({ onBookingCreated }: BookingFormProps) {
  const [isFindingDestinations, setIsFindingDestinations] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientName: "",
      destination: "",
      travelers: "1",
      budget: 0,
      mobile: "",
      specialRequests: "",
      departureTime: "09:00",
      returnTime: "17:00",
    },
  });

  const handleFindDestinations = async () => {
    const preferences = form.getValues("specialRequests");
    const budget = form.getValues("budget");

    if (!preferences || preferences.length < 10) {
      toast({
        variant: "destructive",
        title: "More information needed",
        description:
          "Please provide more details in 'Special Requests' (at least 10 characters) to find destinations.",
      });
      return;
    }

    if (!budget || budget <= 0) {
      toast({
        variant: "destructive",
        title: "Budget required",
        description: "Please enter a valid budget to find destinations.",
      });
      return;
    }

    setIsFindingDestinations(true);
    const result = await suggestDestinations({ preferences, budget });
    setIsFindingDestinations(false);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description:
          typeof result.error === "string"
            ? result.error
            : "Could not fetch suggestions.",
      });
    } else if (result.suggestions && result.suggestions.length > 0) {
      form.setValue("destination", result.suggestions[0], { shouldValidate: true });
      toast({
        title: "Destination Suggested!",
        description: `We've set the destination to "${
          result.suggestions[0]
        }". Other ideas: ${result.suggestions.slice(1, 3).join(", ")}`,
      });
    } else {
      toast({
        title: "No suggestions found",
        description:
          result.message || "Try to be more specific in your requests.",
      });
    }
  };

  function onSubmit(data: BookingFormValues) {
    const [depHours, depMinutes] = data.departureTime.split(':').map(Number);
    const departureDateTime = setMinutes(setHours(data.departureDate, depHours), depMinutes);

    const [retHours, retMinutes] = data.returnTime.split(':').map(Number);
    const returnDateTime = setMinutes(setHours(data.returnDate, retHours), retMinutes);

    onBookingCreated({
        ...data,
        departureDate: departureDateTime,
        returnDate: returnDateTime,
    });
    toast({
      title: "Booking Created!",
      description: `Booking for ${data.clientName} to ${data.destination} has been created successfully.`,
    });
    form.reset();
  }

  return (
    <Card className="shadow-sm mt-6">
      <CardHeader>
        <CardTitle>Add New Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Mobile</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter mobile number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="Or use AI suggestion" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Departure Date</FormLabel>
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
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Return Date</FormLabel>
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
                            date < (form.getValues("departureDate") || new Date(new Date().setHours(0, 0, 0, 0)))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="returnTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Time</FormLabel>
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
                name="travelers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travelers</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of travelers" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Traveler</SelectItem>
                        <SelectItem value="2">2 Travelers</SelectItem>
                        <SelectItem value="3">3 Travelers</SelectItem>
                        <SelectItem value="4">4 Travelers</SelectItem>
                        <SelectItem value="5+">5+ Travelers</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferences for AI</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="e.g., 'A relaxing beach vacation with lots of good food and cultural sites.'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleFindDestinations}
                disabled={isFindingDestinations}
                className="w-full sm:w-auto"
              >
                {isFindingDestinations ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Suggest Destination
              </Button>
              <Button type="submit" className="w-full flex-grow sm:w-auto">
                Create Booking
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
