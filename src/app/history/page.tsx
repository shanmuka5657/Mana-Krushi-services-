
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getBookings, getCurrentUser, getCurrentUserName } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import RecentBookings from '@/components/dashboard/recent-bookings';

function HistoryPageContent() {
    const [pastBookings, setPastBookings] = useState<Booking[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'passenger';

    useEffect(() => {
        const fetchHistory = async () => {
            const allBookings = await getBookings(true);
            const currentUserEmail = getCurrentUser();
            const currentUserName = getCurrentUserName();

            let userBookings: Booking[] = [];

            if (role === 'passenger' && currentUserEmail) {
                userBookings = allBookings.filter(b => b.clientEmail === currentUserEmail);
            } else if (role === 'owner' && currentUserName) {
                userBookings = allBookings.filter(b => b.driverName === currentUserName);
            } else {
                 userBookings = allBookings; // Admins see all history
            }
            
            const now = new Date();
            // Filter for past, completed, or cancelled bookings
            const historyBookings = userBookings
                .filter(b => new Date(b.departureDate) < now || b.status === 'Completed' || b.status === 'Cancelled')
                .sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());

            setPastBookings(historyBookings);
            setIsLoaded(true);
        };
        fetchHistory();
    }, [role]);

    if (!isLoaded) {
        return <AppLayout><div>Loading booking history...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>A record of your past and cancelled rides.</CardDescription>
                </CardHeader>
            </Card>
            <RecentBookings bookings={pastBookings} onUpdateBooking={() => {}} />
        </AppLayout>
    );
}

export default function HistoryPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <HistoryPageContent />
        </Suspense>
    );
}
