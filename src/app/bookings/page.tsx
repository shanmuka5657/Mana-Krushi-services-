
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import RecentBookings from '@/components/dashboard/recent-bookings';
import { getBookings, saveBookings, getCurrentUserName, getCurrentUser } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function BookingsPageContent() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'passenger';

    useEffect(() => {
        const fetchBookings = async () => {
            const allBookings = await getBookings();
            let userBookings: Booking[] = [];
            const currentUserEmail = getCurrentUser();
            const currentUserName = getCurrentUserName();

            if (role === 'passenger' && currentUserEmail) {
                userBookings = allBookings.filter(b => b.clientEmail === currentUserEmail);
            } else if (role === 'owner' && currentUserName) {
                userBookings = allBookings.filter(b => b.driverName === currentUserName);
            }
            
            const now = new Date();
            const upcomingBookings = userBookings
                .filter(b => new Date(b.departureDate) >= now)
                .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());

            const pastBookings = userBookings
                .filter(b => new Date(b.departureDate) < now)
                .sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());
            
            setBookings([...upcomingBookings, ...pastBookings]);
            setIsLoaded(true);
        };
        fetchBookings();
    }, [role]);
    
    const handleUpdateBooking = async (updatedBooking: Booking) => {
        const allBookings = await getBookings();
        const updatedAllBookings = allBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
        await saveBookings(updatedAllBookings);
        
        let userBookings: Booking[] = [];
        const currentUserEmail = getCurrentUser();
        const currentUserName = getCurrentUserName();

        if (role === 'passenger' && currentUserEmail) {
            userBookings = updatedAllBookings.filter(b => b.clientEmail === currentUserEmail);
        } else if (role === 'owner' && currentUserName) {
            userBookings = updatedAllBookings.filter(b => b.driverName === currentUserName);
        }
        
        const now = new Date();
        const upcomingBookings = userBookings
            .filter(b => new Date(b.departureDate) >= now)
            .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());

        const pastBookings = userBookings
            .filter(b => new Date(b.departureDate) < now)
            .sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());

        setBookings([...upcomingBookings, ...pastBookings]);
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
        <Suspense fallback={<AppLayout><div>Loading bookings...</div></AppLayout>}>
            <BookingsPageContent />
        </Suspense>
    )
}
