
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { getBookings, getCurrentUserName } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { User, Phone, Clock, Car } from 'lucide-react';
import { Suspense } from 'react';

function MyRoutesPageContent() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const ownerName = getCurrentUserName();
        const allBookings = getBookings();
        const ownerBookings = allBookings.filter(b => b.driverName === ownerName);
        setBookings(ownerBookings);
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (date) {
            const selectedDateStr = format(date, 'yyyy-MM-dd');
            const newFilteredBookings = bookings.filter(b => format(new Date(b.departureDate), 'yyyy-MM-dd') === selectedDateStr);
            setFilteredBookings(newFilteredBookings);
        } else {
            setFilteredBookings([]);
        }
    }, [date, bookings]);

    if (!isLoaded) {
        return <AppLayout><div>Loading routes...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>Select a Date</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                           <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md"
                                initialFocus
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bookings for {date ? format(date, 'PPP') : '...'}</CardTitle>
                            <CardDescription>
                                {filteredBookings.length} booking(s) found for this date.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map(booking => (
                                    <div key={booking.id} className="border p-4 rounded-lg space-y-3">
                                        <div className="flex justify-between items-center">
                                             <h3 className="font-semibold">{booking.destination}</h3>
                                             <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{booking.id}</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <span>{booking.client}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-muted-foreground" />
                                                <span>{booking.mobile}</span>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                <span>Departs at {format(new Date(booking.departureDate), 'HH:mm')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Car className="w-4 h-4 text-muted-foreground" />
                                                <span>{booking.vehicleType}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground py-16">
                                    <p>No bookings for the selected date.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

export default function MyRoutesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MyRoutesPageContent />
        </Suspense>
    );
}
