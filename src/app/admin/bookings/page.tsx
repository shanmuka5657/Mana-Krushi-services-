
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import RecentBookings from '@/components/dashboard/recent-bookings';
import { getBookings, saveBookings } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function AdminAllBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchBookings = async () => {
            const allBookings = await getBookings(true);
            setBookings(allBookings);
            setIsLoaded(true);
        };
        fetchBookings();
    }, []);
    
    const handleUpdateBooking = async (updatedBooking: Booking) => {
        const allBookings = await getBookings(true);
        const updatedAllBookings = allBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
        await saveBookings(updatedAllBookings);
        setBookings(updatedAllBookings);
    };

    if (!isLoaded) {
        return <AppLayout><div>Loading all bookings...</div></AppLayout>;
    }

    return (
        <AppLayout>
             <Card>
                <CardHeader>
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>A list of all bookings made by all passengers.</CardDescription>
                </CardHeader>
           </Card>
            <RecentBookings bookings={bookings} onUpdateBooking={handleUpdateBooking} />
        </AppLayout>
    );
}

export default function AllBookingsPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading bookings...</div></AppLayout>}>
            <AdminAllBookingsPage />
        </Suspense>
    )
}
