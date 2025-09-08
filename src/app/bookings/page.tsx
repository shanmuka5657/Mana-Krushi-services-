
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import RecentBookings from '@/components/dashboard/recent-bookings';
import { getBookings, saveBookings, getCurrentUser, getCurrentUserName } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function BookingsPageContent() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'passenger';
    const currentUser = role === 'passenger' ? getCurrentUserName() : getCurrentUser();

    useEffect(() => {
        const allBookings = getBookings();
        const userBookings = allBookings.filter(b => {
            if (role === 'passenger') {
                return b.client === currentUser;
            }
            // A simple way to filter for owner. In a real app this link would be more robust.
            return b.driverName === getCurrentUserName();
        });
        setBookings(userBookings);
        setIsLoaded(true);
    }, [currentUser, role]);
    
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
