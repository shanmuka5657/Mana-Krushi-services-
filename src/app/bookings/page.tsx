
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import RecentBookings from '@/components/dashboard/recent-bookings';
import { getBookings, saveBookings, getCurrentUserName } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function BookingsPageContent() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'passenger';
    const currentUserName = getCurrentUserName();

    useEffect(() => {
        const allBookings = getBookings();
        const userBookings = allBookings.filter(b => {
            if (role === 'passenger') {
                // For a passenger, show bookings they created.
                // We assume client name is unique for simplicity.
                return b.client === currentUserName;
            }
             // This page is now only for passengers, but keeping the logic just in case.
            if (role === 'owner') {
                 return b.driverName === currentUserName;
            }
            return false;
        });
        setBookings(userBookings);
        setIsLoaded(true);
    }, [currentUserName, role]);
    
    const handleUpdateBooking = (updatedBooking: Booking) => {
        const allBookings = getBookings();
        const updatedAllBookings = allBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
        saveBookings(updatedAllBookings);
        setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
    };

    if (!isLoaded) {
        return <AppLayout><div>Loading bookings...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <RecentBookings bookings={bookings} onUpdateBooking={handleUpdateBooking} />
        </AppLayout>
    );
}

export default function BookingsPage() {
    return (
        <Suspense>
            <BookingsPageContent />
        </Suspense>
    )
}
