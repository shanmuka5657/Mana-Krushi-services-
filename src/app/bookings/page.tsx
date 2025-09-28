
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import RecentBookings from '@/components/dashboard/recent-bookings';
import { getBookings, getCurrentUser, getProfile } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { startOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

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
            
            // Only fetch upcoming bookings initially
            const today = startOfDay(new Date());
            const userBookings = await getBookings(false, { 
                userEmail, 
                role: userRole,
                date: today.toISOString() // This is a simplification; the logic in storage handles 'from this day forward'
            });
            
            setBookings(userBookings);
            setIsLoaded(true);
        };
        fetchInitialBookings();
    }, []);
    
    if (!isLoaded) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
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
