
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import RecentBookings from '@/components/dashboard/recent-bookings';
import { getBookings, saveBookings, getCurrentUserName, getCurrentUser } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { IndianRupee } from 'lucide-react';

function KotakBanner() {
    return (
        <a href="https://clnk.in/w6hB" target="_blank" rel="noopener noreferrer" className="block w-full group mb-6">
            <Card className="w-full overflow-hidden relative text-white bg-blue-900 aspect-[4/1] md:aspect-[5/1]">
                 <Image 
                    src="https://picsum.photos/seed/kotak-account/1200/240"
                    alt="Kotak 811 Digital Savings Account"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-20"
                    data-ai-hint="bank account"
                />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg md:text-2xl font-bold">Kotak 811 Digital Savings Account</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-md">Open a zero balance savings account online in minutes.</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-blue-900 hover:bg-gray-100 text-xs md:text-sm">
                        Open Account
                    </Button>
                </div>
            </Card>
        </a>
    )
}

function PoonawallaBanner() {
    return (
        <a href="https://clnk.in/w6hE" target="_blank" rel="noopener noreferrer" className="block w-full group mt-6">
            <Card className="w-full overflow-hidden relative text-white bg-green-900 aspect-[4/1] md:aspect-[5/1]">
                 <Image 
                    src="https://picsum.photos/seed/poonawalla-loan/1200/240"
                    alt="Poonawalla Fincorp Instant Loan"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-20"
                    data-ai-hint="finance loan"
                />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg md:text-2xl font-bold">Poonawalla Fincorp Instant Loan</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-md">Get instant personal loans with attractive interest rates.</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-green-900 hover:bg-gray-100 text-xs md:text-sm">
                        Apply Now
                    </Button>
                </div>
            </Card>
        </a>
    )
}

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
            
            userBookings.sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());
            setBookings(userBookings);
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
        
        userBookings.sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());
        setBookings(userBookings);
    };

    if (!isLoaded) {
        return <AppLayout><div>Loading bookings...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <KotakBanner />
            <RecentBookings bookings={bookings} onUpdateBooking={handleUpdateBooking} />
            <PoonawallaBanner />
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
