
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapPin, Search, Loader2, LocateFixed } from "lucide-react";
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
import type { Profile } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getMapSuggestions, reverseGeocode } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";


const searchFormSchema = z.object({
  fromLocation: z.string().min(2, "Starting location is required."),
  toLocation: z.string().min(2, "Destination is required."),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

interface PassengerDashboardProps {
  onSwitchTab: (tab: string) => void;
  profile: Profile | null;
}

// --- Location Autocomplete Component ---
const LocationAutocompleteInput = ({ field, onLocationSelect, placeholder }: { field: any, onLocationSelect: (location: string) => void, placeholder?: string }) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [query, setQuery] = useState(field.value || '');
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setQuery(field.value);
    }, [field.value]);

    const fetchSuggestions = async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        const result = await getMapSuggestions(searchQuery);
        setIsLoading(false);

        if (result.error) {
            console.error(result.error);
            setSuggestions([]);
        } else if (result.suggestions) {
            setSuggestions(result.suggestions);
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
                    placeholder={placeholder}
                />
                {isLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />}
            </div>
            {isFocused && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-card border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={suggestion.eLoc || index}
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


export default function PassengerDashboard({ onSwitchTab, profile }: PassengerDashboardProps) {
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile === null || !profile.mobile || profile.mobile === '0000000000') {
      setShowProfilePrompt(true);
    }
  }, [profile]);
  
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      fromLocation: "",
      toLocation: "",
    },
  });

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation is not supported by your browser.", variant: "destructive" });
      return;
    }
    
    setIsGettingLocation(true);
    toast({ title: "Getting your location..." });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const result = await reverseGeocode(latitude, longitude);
        setIsGettingLocation(false);

        if (result.error) {
          toast({ title: "Could not get address", description: result.error, variant: "destructive" });
        } else if (result.address) {
          form.setValue("fromLocation", result.address, { shouldValidate: true });
          toast({ title: "Location set!", description: result.address });
        }
      },
      () => {
        setIsGettingLocation(false);
        toast({ title: "Unable to retrieve your location.", description: "Please ensure location permissions are enabled.", variant: "destructive" });
      }
    );
  };
  
  function onSubmit(data: SearchFormValues) {
    setIsSearching(true);
    const params = new URLSearchParams({
        from: data.fromLocation,
        to: data.toLocation,
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
                               <div className="flex gap-2">
                                <FormControl>
                                    <LocationAutocompleteInput
                                        field={field}
                                        onLocationSelect={(location) => form.setValue('fromLocation', location)}
                                        placeholder="Starting point"
                                    />
                                </FormControl>
                                <Button type="button" variant="outline" size="icon" onClick={handleUseCurrentLocation} disabled={isGettingLocation}>
                                    {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                                    <span className="sr-only">Use current location</span>
                                </Button>
                              </div>
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
                                    placeholder="Destination"
                                  />
                              </FormControl>
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
