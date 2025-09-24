
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import RecentBookings from '@/components/dashboard/recent-bookings';
import { getBookings, getCurrentUser, getProfile } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function HistoryPageContent() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

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
            <RecentBookings initialBookings={bookings} mode="past" />
        </AppLayout>
    );
}

export default function HistoryPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading history...</div></AppLayout>}>
            <HistoryPageContent />
        </Suspense>
    )
}
