
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import RecentBookings from '@/components/dashboard/recent-bookings';
import { getBookings, getCurrentUser, getProfile } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { startOfDay } from 'date-fns';

function BookingsPageContent() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchInitialBookings = async () => {
            const userEmail = getCurrentUser();
            if (!userEmail) {
                setIsLoaded(true);
                return;
            }
            
            const userProfile = await getProfile(userEmail);
            const userRole = userProfile?.role || 'passenger';
            
            // Fetch all bookings for the user initially
            const userBookings = await getBookings(false, { userEmail, role: userRole });
            
            // The filtering will now happen inside the RecentBookings component
            setBookings(userBookings);
            setIsLoaded(true);
        };
        fetchInitialBookings();
    }, []);
    
    if (!isLoaded) {
        return <AppLayout><div>Loading bookings...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <RecentBookings initialBookings={bookings} mode="upcoming" />
        </AppLayout>
    );
}

export default function BookingsPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading bookings...</div></AppLayout>}>
            <BookingsPageContent />
        </Suspense>
    )
}
