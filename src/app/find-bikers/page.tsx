

"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRoutes, getProfile, getCurrentUserName } from '@/lib/storage';
import type { Route, Profile } from '@/lib/types';
import { getMapSuggestions } from '@/app/actions';
import { MapPin, Search, Loader2, Bike, User, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const searchFormSchema = z.object({
  fromLocation: z.string().min(2, "Starting location is required."),
  toLocation: z.string().min(2, "Destination is required."),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

const LocationAutocompleteInput = ({ field, onLocationSelect }: { field: any, onLocationSelect: (location: string) => void }) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [query, setQuery] = useState(field.value || '');
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setQuery(field.value);
    }, [field.value]);

    const fetchSuggestions = async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        const result = await getMapSuggestions(searchQuery);
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
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => fetchSuggestions(value), 300);
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
                    onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                    className="pl-10"
                    autoComplete="off"
                />
            </div>
            {isFocused && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-card border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {suggestions.map((suggestion) => (
                        <li key={suggestion.eLoc} onMouseDown={() => handleSuggestionClick(suggestion)} className="px-4 py-2 hover:bg-muted cursor-pointer">
                            <p className="font-semibold text-sm">{suggestion.placeName}</p>
                            <p className="text-xs text-muted-foreground">{suggestion.placeAddress}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

function FindBikersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [isSearching, setIsSearching] = useState(false);
    const [bikers, setBikers] = useState<Route[]>([]);
    const [driverProfiles, setDriverProfiles] = useState<Map<string, Profile>>(new Map());

    const fromLocation = searchParams.get('from') || '';
    const toLocation = searchParams.get('to') || '';
    const startTime = searchParams.get('startTime') || '';
    const endTime = searchParams.get('endTime') || '';

    const form = useForm<SearchFormValues>({
        resolver: zodResolver(searchFormSchema),
        defaultValues: {
            fromLocation,
            toLocation,
            startTime,
            endTime,
        },
    });

    useEffect(() => {
        const fetchBikers = async () => {
            if (fromLocation && toLocation) {
                setIsSearching(true);
                setBikers([]);
                
                const allRoutes = await getRoutes(true); // Fetch all routes
                
                const lowerFrom = fromLocation.toLowerCase();
                const lowerTo = toLocation.toLowerCase();

                let filteredRoutes = allRoutes.filter(route => {
                    if (route.vehicleType !== 'Bike') {
                        return false;
                    }

                    const fromMatch = route.fromLocation.toLowerCase().includes(lowerFrom);
                    const toMatch = route.toLocation.toLowerCase().includes(lowerTo);

                    if (!fromMatch || !toMatch) {
                        return false;
                    }
                    
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    if (new Date(route.travelDate) < today) {
                        return false;
                    }

                    if (startTime && endTime) {
                        const routeDeparture = route.departureTime;
                        return routeDeparture >= startTime && routeDeparture <= endTime;
                    }
                    
                    return true;
                });

                // Sort results: exact matches first, then by date
                filteredRoutes.sort((a, b) => {
                    const aFromExact = a.fromLocation.toLowerCase() === lowerFrom;
                    const bFromExact = b.fromLocation.toLowerCase() === lowerFrom;
                    const aToExact = a.toLocation.toLowerCase() === lowerTo;
                    const bToExact = b.toLocation.toLowerCase() === lowerTo;

                    const aIsExact = aFromExact && aToExact;
                    const bIsExact = bFromExact && bToExact;

                    if (aIsExact && !bIsExact) return -1;
                    if (!aIsExact && bIsExact) return 1;

                    // If both are exact or both are not, sort by date
                    return new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime();
                });
                
                setBikers(filteredRoutes);

                if (filteredRoutes.length > 0) {
                    const driverEmails = new Set(filteredRoutes.map(r => r.ownerEmail));
                    const newProfilesToFetch = Array.from(driverEmails).filter(email => !driverProfiles.has(email));
                    if (newProfilesToFetch.length > 0) {
                        const profilePromises = newProfilesToFetch.map(email => getProfile(email));
                        const profiles = await Promise.all(profilePromises);
                        setDriverProfiles(prev => {
                            const newMap = new Map(prev);
                            profiles.forEach(p => p && newMap.set(p.email, p));
                            return newMap;
                        });
                    }
                }
                setIsSearching(false);
            }
        };
        fetchBikers();
    }, [fromLocation, toLocation, startTime, endTime]);

    function onSubmit(data: SearchFormValues) {
        const params = new URLSearchParams({
            from: data.fromLocation,
            to: data.toLocation,
        });
        if (data.startTime) params.set('startTime', data.startTime);
        if (data.endTime) params.set('endTime', data.endTime);
        router.push(`/find-bikers?${params.toString()}`);
    }

    const handleAlertBikers = () => {
        const passengerName = getCurrentUserName() || 'A passenger';
        const numbers = bikers.map(b => b.driverMobile).filter(Boolean);
        
        if (numbers.length === 0) {
            toast({ title: 'No bikers to notify.', variant: 'destructive'});
            return;
        }
        
        const message = `Hi, I'm looking for a bike ride from ${fromLocation} to ${toLocation}. Please let me know if you have a seat available. My name is ${passengerName}.`;

        const uniqueNumbers = [...new Set(numbers)];
        
        toast({
            title: `Notifying ${uniqueNumbers.length} biker(s)`,
            description: "Your browser may ask for permission to open multiple WhatsApp windows.",
        });

        setTimeout(() => {
            uniqueNumbers.forEach(num => {
                const whatsappUrl = `https://wa.me/91${num}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            });
        }, 1500);
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bike /> Find Bikers</CardTitle>
                        <CardDescription>Search for two-wheeler rides and notify all bikers on a route at once.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="fromLocation" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>From</FormLabel>
                                            <FormControl><LocationAutocompleteInput field={field} onLocationSelect={(loc) => form.setValue('fromLocation', loc)}/></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="toLocation" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>To</FormLabel>
                                            <FormControl><LocationAutocompleteInput field={field} onLocationSelect={(loc) => form.setValue('toLocation', loc)}/></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="startTime"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Time</FormLabel>
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
                                        name="endTime"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Time</FormLabel>
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
                                <Button type="submit" className="w-full" disabled={isSearching}>
                                    {isSearching ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching...</> : <><Search className="mr-2 h-4 w-4" />Search</>}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {(fromLocation && toLocation && !isSearching) && (
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle>Results for {fromLocation} to {toLocation}</CardTitle>
                                    <CardDescription>Found {bikers.length} bikers on this route.</CardDescription>
                                </div>
                                {bikers.length > 0 && (
                                    <Button onClick={handleAlertBikers}><MessageSquare className="mr-2 h-4 w-4" /> Alert All Bikers</Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {bikers.length > 0 ? bikers.map(biker => {
                                const profile = driverProfiles.get(biker.ownerEmail);
                                return (
                                <div key={biker.id} className="border p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={profile?.selfieDataUrl} />
                                            <AvatarFallback>{biker.driverName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold flex items-center gap-2">
                                                {biker.driverName}
                                                {profile?.mobileVerified && (
                                                     <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 p-1 h-4">
                                                        <CheckCircle className="h-3 w-3" />
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{biker.vehicleNumber}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>Last seen: {format(new Date(biker.travelDate), "PPP")}</span>
                                    </div>
                                </div>
                            )}) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <Bike className="mx-auto h-12 w-12" />
                                    <h3 className="mt-4 text-lg font-medium">No Bikers Found</h3>
                                    <p className="mt-1 text-sm">There are no two-wheeler rides registered for this route yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}


export default function FindBikersPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <FindBikersContent />
        </Suspense>
    )
}

    