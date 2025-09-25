"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRoutes, getBookings, getAllProfiles, getProfile } from '@/lib/storage';
import type { Route, Booking, Profile } from '@/lib/types';
import { Bike, Star, Users, Milestone, Zap, CheckCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import placeholderImages from '@/lib/placeholder-images.json';
import { Input } from '@/components/ui/input';

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


function BikerRidesPage() {
    const router = useRouter();
    
    const [allRoutes, setAllRoutes] = useState<Route[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [driverProfiles, setDriverProfiles] = useState<Map<string, Profile>>(new Map());
    const [isLoaded, setIsLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    useEffect(() => {
        const fetchAndFilterRoutes = async () => {
            const allRoutesData = await getRoutes(true);

            // Filter routes for only bikes and future dates
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const bikerRoutes = allRoutesData.filter(route => {
                const routeDate = new Date(route.travelDate);
                return route.vehicleType === 'Bike' && routeDate >= today;
            });

            if (bikerRoutes.length > 0) {
                // Fetch bookings only for the routes found
                const bookingsPromises = bikerRoutes.map(route => getBookings(true, {
                    destination: `${route.fromLocation} to ${route.toLocation}`,
                    date: format(new Date(route.travelDate), 'yyyy-MM-dd'),
                    time: route.departureTime,
                }));
                const bookingsByRoute = await Promise.all(bookingsPromises);
                const allRelevantBookings = bookingsByRoute.flat();
                setAllBookings(allRelevantBookings);
                
                // Fetch profiles only for the drivers found
                const driverEmails = new Set(bikerRoutes.map(r => r.ownerEmail));
                const profilePromises = Array.from(driverEmails).map(email => getProfile(email));
                const profiles = await Promise.all(profilePromises);

                const profilesMap = new Map<string, Profile>();
                profiles.forEach(p => {
                    if (p) profilesMap.set(p.email, p);
                });
                setDriverProfiles(profilesMap);
            }
            
            bikerRoutes.sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime());

            setAllRoutes(bikerRoutes);
            setIsLoaded(true);
        }
        fetchAndFilterRoutes();
    }, []);

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
        return driverProfiles.get(ownerEmail);
    }
    
    const availableBikerRoutes = allRoutes.filter(route => {
        const bookedSeats = getBookedSeats(route);
        const availableSeats = route.availableSeats - bookedSeats;
        
        const searchTerm = searchQuery.toLowerCase();
        const matchesSearch = searchTerm === '' ||
            route.fromLocation.toLowerCase().includes(searchTerm) ||
            route.toLocation.toLowerCase().includes(searchTerm) ||
            route.driverName.toLowerCase().includes(searchTerm);

        return availableSeats > 0 && matchesSearch;
    });

    if (!isLoaded) {
        return <AppLayout><div>Loading community rides...</div></AppLayout>
    }
    
    const { noRoutes } = placeholderImages;

    return (
        <AppLayout>
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Users />
                           Community Hub
                        </CardTitle>
                        <CardDescription>
                            Find and book rides with bikers in your community.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Search by location or biker name..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {availableBikerRoutes.length > 0 ? (
                    <div className="space-y-4">
                        {availableBikerRoutes.map((route) => {
                            const bookedSeats = getBookedSeats(route);
                            const availableSeats = route.availableSeats - bookedSeats;
                            const driverProfile = getDriverProfile(route.ownerEmail);
                            
                            const [depHours, depMinutes] = route.departureTime.split(':').map(Number);
                            const departureDateTime = new Date(route.travelDate);
                            departureDateTime.setHours(depHours, depMinutes, 0, 0);
                            const isPast = departureDateTime < new Date();

                            return (
                            <Card key={route.id} className={cn("overflow-hidden transition-all", route.isPromoted && "border-yellow-400 border-2 bg-yellow-50/50 dark:bg-yellow-900/10")}>
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
                                                <div className="text-sm text-muted-foreground">{format(new Date(route.travelDate), "PPP")}</div>
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
                                            <span>{availableSeats > 0 ? `${availableSeats} seat left` : 'Sold out'}</span>
                                        </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Bike className="text-muted-foreground h-5 w-5" />
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
                                alt="No biker routes found"
                                className="mb-4"
                                data-ai-hint={noRoutes.hint}
                            />
                            <h3 className="text-xl font-semibold">No Biker Rides Found</h3>
                            <p className="text-muted-foreground mt-2 max-w-md">
                                There are no upcoming biker rides available right now. Check back later!
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

export default function CommunityPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <BikerRidesPage />
        </Suspense>
    )
}
