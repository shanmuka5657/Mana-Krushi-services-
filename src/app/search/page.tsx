

"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRoutes, getBookings, getAllProfiles } from '@/lib/storage';
import type { Route, Booking, Profile } from '@/lib/types';
import { Car, Star, Users, Milestone, ArrowLeft, Zap, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import placeholderImages from '@/lib/placeholder-images.json';

const getTravelDuration = (departureTime: string, arrivalTime: string): string => {
    try {
        const departure = new Date(`1970-01-01T${departureTime}:00`);
        const arrival = new Date(`1970-01-01T${arrivalTime}:00`);
        const diffMinutes = (arrival.getTime() - departure.getTime()) / (1000 * 60);
        if (diffMinutes < 0) return "";

        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        
        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;

    } catch (e) {
        return "";
    }
}


function GlobalSearchResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [allRoutes, setAllRoutes] = useState<Route[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    
    // Handle incoming share data
    const sharedTitle = searchParams.get('title') || '';
    const sharedText = searchParams.get('text') || '';
    const sharedUrl = searchParams.get('url') || '';
    const searchQuery = searchParams.get('q') || '';

    // Combine shared data into a single query if it exists
    const query = searchQuery || [sharedTitle, sharedText, sharedUrl].filter(Boolean).join(' ');


    useEffect(() => {
        const fetchAllData = async () => {
            if (!query) {
                setIsLoaded(true);
                return;
            };

            const [routes, bookings, profiles] = await Promise.all([
                getRoutes(true),
                getBookings(true),
                getAllProfiles(),
            ]);

            setAllBookings(bookings);
            setAllRoutes(routes);
            setAllProfiles(profiles);
            setIsLoaded(true);
        }
        fetchAllData();
    }, [query]);

    const getBookedSeats = (route: Route) => {
        return allBookings.filter(b => {
           const routeDate = new Date(route.travelDate);
           const bookingDate = new Date(b.departureDate);
           const isSameDay = routeDate.getFullYear() === bookingDate.getFullYear() &&
                             routeDate.getMonth() === bookingDate.getMonth() &&
                             routeDate.getDate() === bookingDate.getDate();
           const bookingTime = format(bookingDate, 'HH:mm');
   
           return (
               b.destination === `${route.fromLocation} to ${route.toLocation}` &&
               isSameDay &&
               bookingTime === route.departureTime &&
               b.status !== "Cancelled"
           );
       }).reduce((acc, b) => acc + (Number(b.travelers) || 1), 0);
     }
     
    const getDriverProfile = (ownerEmail?: string): Profile | undefined => {
        if (!ownerEmail) return undefined;
        return allProfiles.find(p => p.email === ownerEmail);
    }

    const filteredRoutes = allRoutes.filter(route => {
        const searchTerm = query.toLowerCase();
        return (
            route.driverName.toLowerCase().includes(searchTerm) ||
            (route.vehicleNumber && route.vehicleNumber.toLowerCase().includes(searchTerm)) ||
            route.fromLocation.toLowerCase().includes(searchTerm) ||
            route.toLocation.toLowerCase().includes(searchTerm)
        );
    });

    if (!isLoaded) {
        return <AppLayout><div>Loading results...</div></AppLayout>
    }
    
    const { noRoutes } = placeholderImages;

    return (
        <AppLayout>
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Search Results for "{query}"
                        </CardTitle>
                        <p className="text-muted-foreground">
                            Found {filteredRoutes.length} matching rides.
                        </p>
                    </CardHeader>
                </Card>

                {filteredRoutes.length > 0 ? (
                    <div className="space-y-4">
                        {filteredRoutes.map((route) => {
                            const bookedSeats = getBookedSeats(route);
                            const availableSeats = route.availableSeats - bookedSeats;
                            const driverProfile = getDriverProfile(route.ownerEmail);
                            
                            const [depHours, depMinutes] = route.departureTime.split(':').map(Number);
                            const departureDateTime = new Date(route.travelDate);
                            departureDateTime.setHours(depHours, depMinutes, 0, 0);
                            const isPast = departureDateTime < new Date();

                            return (
                            <Card key={route.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div>
                                                <div className="font-semibold">{route.departureTime}</div>
                                                <div className="text-sm text-muted-foreground">{getTravelDuration(route.departureTime, route.arrivalTime)}</div>
                                                <div className="font-semibold mt-2">{route.arrivalTime}</div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full border-2 border-primary"></div>
                                            <div className="w-px h-10 bg-border my-1"></div>
                                            <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary"></div>
                                            </div>
                                            <div>
                                                <div className="font-semibold">{route.fromLocation}</div>
                                                <div className="text-xs text-muted-foreground">{format(new Date(route.travelDate), "dd MMM yyyy")}</div>
                                                {route.distance && (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1 my-1">
                                                    <Milestone className="h-3 w-3" />
                                                    <span>{route.distance.toFixed(0)} km</span>
                                                </div>
                                                )}
                                                <div className="font-semibold mt-2">{route.toLocation}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                        <div className="text-lg font-bold">
                                            ₹{(route.price || 0).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center justify-end gap-1 mt-1">
                                            <Users className="h-4 w-4" />
                                            <span>{availableSeats > 0 ? `${availableSeats} seats left` : 'Sold out'}</span>
                                        </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Car className="text-muted-foreground" />
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={driverProfile?.selfieDataUrl || `https://ui-avatars.com/api/?name=${route.driverName.replace(' ', '+')}&background=random`} />
                                            <AvatarFallback>{route.driverName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold text-sm flex items-center gap-2">
                                                {route.driverName}
                                                 {driverProfile?.mobileVerified && (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 p-1 h-4">
                                                        <CheckCircle className="h-3 w-3" />
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-xs text-muted-foreground">{(route.rating || 0).toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {availableSeats > 0 && !isPast && (
                                    <Button size="sm" onClick={() => router.push(`/book/${route.id}`)}>
                                        <Zap className="mr-2 h-4 w-4" />
                                        Book Now
                                    </Button>
                                    )}
                                </CardFooter>
                            </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                            <Image 
                                src={noRoutes.url}
                                width={noRoutes.width}
                                height={noRoutes.height}
                                alt="No routes found"
                                className="mb-4"
                                data-ai-hint={noRoutes.hint}
                            />
                            <h3 className="text-xl font-semibold">No Rides Found</h3>
                            <p className="text-muted-foreground mt-2 max-w-md">
                                Your search for "{query}" did not match any available rides. Try a different search term.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <GlobalSearchResultsPage />
        </Suspense>
    )
}
