

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapPin, Search, Loader2, LocateFixed, Hand, Plane, Users, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
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
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";


const searchFormSchema = z.object({
  fromLocation: z.string().min(2, "Starting location is required."),
  toLocation: z.string().min(2, "Destination is required."),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

interface PassengerDashboardProps {
  onSwitchTab: (tab: string) => void;
  profile: Profile | null;
}

const NavLink = ({ href, icon: Icon, title, description }: { href: string, icon: React.ElementType, title: string, description: string }) => (
    <Link href={href} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
            <Icon className="h-6 w-6 text-muted-foreground" />
            <div>
                <h4 className="font-medium">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
);


const LocationAutocompleteInput = ({
    field,
    placeholder,
    id,
}: {
    field: any;
    placeholder: string;
    id: string;
}) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchSuggestions = useCallback(async (query: string) => {
        setSuggestions([]); // Clear previous suggestions
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        const result = await getMapSuggestions(query);
        setIsLoading(false);
        if (result.error) {
            console.error("Error fetching map suggestions:", result.error);
        } else if(result.suggestions) {
            setSuggestions(result.suggestions);
        }
    }, []);

    const onInputChange = (value: string) => {
        field.onChange(value);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    const handleSuggestionClick = (suggestion: any) => {
        field.onChange(suggestion.placeName);
        setSuggestions([]);
        setIsFocused(false);
    };

    return (
        <div className="relative">
            <div className="relative">
                 <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    {...field}
                    id={id}
                    placeholder={placeholder}
                    className="pl-10"
                    onChange={(e) => onInputChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 150)} 
                    autoComplete="off"
                />
            </div>
            {isFocused && (isLoading || suggestions.length > 0) && (
                <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                    {isLoading ? (
                        <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                    ) : (
                        suggestions.map((suggestion, index) => (
                            <div
                                key={`${suggestion.eLoc}-${index}`}
                                className="p-2 hover:bg-muted cursor-pointer"
                                onMouseDown={() => handleSuggestionClick(suggestion)}
                            >
                                <p className="font-semibold">{suggestion.placeName}</p>
                                <p className="text-xs text-muted-foreground">{suggestion.placeAddress}</p>
                            </div>
                        ))
                    )}
                </div>
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
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);


  useEffect(() => {
    if (profile === null || !profile.mobile || profile.mobile === '0000000000') {
      setShowProfilePrompt(true);
    }
     // Check if we should show the location prompt
    const locationPromptDismissed = localStorage.getItem('locationPromptDismissed');
    if (!locationPromptDismissed) {
      setShowLocationPrompt(true);
    }
  }, [profile]);
  
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      fromLocation: "",
      toLocation: "",
    },
  });

  const handleUseCurrentLocation = async (isInitialPrompt = false) => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation is not supported by your browser.", variant: "destructive" });
      return;
    }
    
    if (isInitialPrompt) {
      setShowLocationPrompt(false);
      localStorage.setItem('locationPromptDismissed', 'true');
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

      {showLocationPrompt && (
        <Alert>
          <Hand className="h-4 w-4" />
          <AlertTitle>Get Better Suggestions!</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p>Allow location access to get ride suggestions from your current area.</p>
            <div className="flex gap-2 flex-shrink-0">
               <Button onClick={() => handleUseCurrentLocation(true)} size="sm">Allow Access</Button>
               <Button onClick={() => {
                   setShowLocationPrompt(false);
                   localStorage.setItem('locationPromptDismissed', 'true');
               }} variant="ghost" size="sm">Dismiss</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
                                      placeholder="Starting point"
                                      id={useFormField().id}
                                  />
                                </FormControl>
                                <Button type="button" variant="outline" size="icon" onClick={() => handleUseCurrentLocation()} disabled={isGettingLocation}>
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
                                    placeholder="Destination"
                                    id={useFormField().id}
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
      
      <div className="space-y-4">
            <NavLink 
                href="/bookings?role=passenger"
                icon={Plane}
                title="My Bookings"
                description="View and manage your upcoming rides."
            />
        </div>

    </div>
  );
}
