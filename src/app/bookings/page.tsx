
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
    const roleParam = searchParams.get('role') || 'passenger';

    useEffect(() => {
        const fetchInitialBookings = async () => {
            const userEmail = getCurrentUser();
            if (!userEmail) {
                setIsLoaded(true);
                return;
            }
            
            const userProfile = await getProfile(userEmail);
            const userRole = userProfile?.role || 'passenger';
            
            const userBookings = await getBookings(false, { userEmail, role: userRole });
            
            const today = startOfDay(new Date());

            const upcomingBookings = userBookings
                .filter(b => {
                    const departureDate = new Date(b.departureDate);
                    return departureDate >= today && b.status !== 'Cancelled';
                })
                .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());

            setBookings(upcomingBookings);
            setIsLoaded(true);
        };
        fetchInitialBookings();
    }, [roleParam]);
    
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
