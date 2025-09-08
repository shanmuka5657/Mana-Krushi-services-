
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const searchFormSchema = z.object({
  fromLocation: z.string().min(2, "Starting location is required."),
  toLocation: z.string().min(2, "Destination is required."),
  travelDate: z.date({
    required_error: "A travel date is required.",
  }),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

const ownerList = [
    { id: 1, ownerName: 'Alice', from: 'New York', to: 'Boston', departure: '08:00', arrival: '12:00', seats: 3, vehicle: 'Sedan' },
    { id: 2, ownerName: 'Bob', from: 'San Francisco', to: 'Los Angeles', departure: '10:00', arrival: '16:00', seats: 2, vehicle: 'SUV' },
    { id: 3, ownerName: 'Charlie', from: 'New York', to: 'Boston', departure: '14:00', arrival: '18:00', seats: 4, vehicle: 'Minivan' },
];


export default function PassengerDashboard() {
  const [availableOwners, setAvailableOwners] = useState<typeof ownerList>([]);
  const { toast } = useToast();
  
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      fromLocation: "",
      toLocation: "",
    },
  });

  function onSubmit(data: SearchFormValues) {
    console.log(data);
    const results = ownerList.filter(owner => 
      owner.from.toLowerCase() === data.fromLocation.toLowerCase() &&
      owner.to.toLowerCase() === data.toLocation.toLowerCase()
    );
    setAvailableOwners(results);

    if (results.length === 0) {
        toast({
            title: "No Routes Found",
            description: "No owners are currently serving this route on the selected date.",
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
                <h3 className="text-xl font-bold">Available Owners</h3>
                {availableOwners.map(owner => (
                    <Card key={owner.id}>
                        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                            <div className="font-semibold">{owner.ownerName}'s {owner.vehicle}</div>
                            <div>{owner.from} &rarr; {owner.to}</div>
                            <div>{owner.departure} - {owner.arrival}</div>
                            <div className="flex justify-end">
                                <Button>Book ({owner.seats} seats left)</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
    </div>
  );
}
