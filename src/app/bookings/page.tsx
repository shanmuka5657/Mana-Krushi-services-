
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
        let userBookings: Booking[] = [];

        if (role === 'passenger') {
            const passengerName = getCurrentUserName();
            if (passengerName) {
                userBookings = allBookings.filter(b => b.client === passengerName);
            }
        } else if (role === 'owner') {
             // This page is mainly for passengers, but if an owner lands here,
             // maybe show bookings related to them.
            const ownerName = getCurrentUserName();
            userBookings = allBookings.filter(b => b.driverName === ownerName);
        }
        
        setBookings(userBookings);
        setIsLoaded(true);
    }, [role]);
    
    const handleUpdateBooking = (updatedBooking: Booking) => {
        const allBookings = getBookings();
        const updatedAllBookings = allBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
        saveBookings(updatedAllBookings);
        
        let userBookings: Booking[] = [];
        if (role === 'passenger') {
            const passengerName = getCurrentUserName();
             if (passengerName) {
                userBookings = updatedAllBookings.filter(b => b.client === passengerName);
            }
        } else if (role === 'owner') {
            const ownerName = getCurrentUserName();
            userBookings = updatedAllBookings.filter(b => b.driverName === ownerName);
        }
        setBookings(userBookings);
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
