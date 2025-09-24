

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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

// --- Location Autocomplete Component ---
const LocationAutocompleteInput = ({ field, onLocationSelect }: { field: any, onLocationSelect: (location: string) => void }) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const fetchSuggestions = async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        const apiKey = process.env.NEXT_PUBLIC_MAPMYINDIA_API_KEY;
        if (!apiKey) {
            console.error("MapmyIndia API key is not configured.");
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(`https://atlas.mapmyindia.com/api/places/search/json?query=${searchQuery}&location=india`, {
                headers: {
                    'Authorization': `bearer ${apiKey}`
                }
            });
            const data = await response.json();
            if (data.suggestedLocations) {
                setSuggestions(data.suggestedLocations);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
            setSuggestions([]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        field.onChange(value);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300); // 300ms debounce
    };

    const handleSuggestionClick = (suggestion: any) => {
        const locationName = suggestion.placeName;
        setQuery(locationName);
        onLocationSelect(locationName);
        setSuggestions([]);
        setIsFocused(false);
    };

    return (
        <div className="relative">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    {...field}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay to allow click
                    className="pl-10"
                    autoComplete="off"
                />
            </div>
            {isFocused && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-card border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion.eLoc}
                            onMouseDown={() => handleSuggestionClick(suggestion)} // Use onMouseDown to fire before onBlur
                            className="px-4 py-2 hover:bg-muted cursor-pointer"
                        >
                            <p className="font-semibold text-sm">{suggestion.placeName}</p>
                            <p className="text-xs text-muted-foreground">{suggestion.placeAddress}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


export default function PassengerDashboard({ onSwitchTab }: PassengerDashboardProps) {
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const checkProfileAndFetchLocations = async () => {
        const profile = await getProfile();
        if (isMounted && (!profile || !profile.mobile || profile.mobile === '0000000000')) {
          setShowProfilePrompt(true);
        }

        // OPTIMIZATION: Rely on sessionStorage first to avoid blocking render.
        // The list will be populated by the owner dashboard or other parts of the app over time.
        const cachedLocations = sessionStorage.getItem('routeLocations');
        if (cachedLocations) {
            setLocations(JSON.parse(cachedLocations));
        } else {
            // As a fallback, you could fetch a small number of *recent* routes, not all of them.
            // For now, we'll leave it empty if not cached to prioritize speed.
            setLocations([]);
        }
        setIsLoading(false);
    }
    if (isMounted) {
      checkProfileAndFetchLocations();
    }
  }, [isMounted]);
  
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
  
  if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
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
                                  <LocationAutocompleteInput
                                    field={field}
                                    onLocationSelect={(location) => form.setValue('fromLocation', location)}
                                  />
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
                                  <LocationAutocompleteInput
                                    field={field}
                                    onLocationSelect={(location) => form.setValue('toLocation', location)}
                                  />
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
