
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import RecentBookings from '@/components/dashboard/recent-bookings';
import { getBookings, saveBookings } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import { format } from 'date-fns';


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

    const handleExport = () => {
        const dataToExport = bookings.map(b => ({
            'Booking ID': b.bookingCode || b.id,
            'Client': b.client,
            'Destination': b.destination,
            'Departure Date': format(new Date(b.departureDate), 'yyyy-MM-dd HH:mm'),
            'Driver': b.driverName,
            'Amount': b.amount,
            'Status': b.status,
            'Payment Status': b.paymentStatus,
        }));
         exportToCsv('all-bookings.csv', dataToExport);
    }

    if (!isLoaded) {
        return <AppLayout><div>Loading all bookings...</div></AppLayout>;
    }

    return (
        <AppLayout>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Bookings</CardTitle>
                        <CardDescription>A list of all bookings made by all passengers.</CardDescription>
                    </div>
                    <Button onClick={handleExport} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
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
