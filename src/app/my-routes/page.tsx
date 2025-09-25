
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import MyRoutes from '@/components/dashboard/my-routes';
import { getRoutes, getCurrentUser } from '@/lib/storage';
import type { Route } from '@/lib/types';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function MyRoutesPageContent() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isLoaded, setIsLoaded] = useState(true); // Default to true to show loader initially
    const searchParams = useSearchParams();
    const bookingIdFromUrl = searchParams.get('booking_id');

    // The data fetching is now handled by the real-time listener in MyRoutes component
    // This component now just acts as a shell and handles the deep link.

    if (!isLoaded) {
        return <AppLayout>
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </AppLayout>;
    }

    return (
        <AppLayout>
           <MyRoutes routes={routes} bookingIdFromUrl={bookingIdFromUrl} />
        </AppLayout>
    );
}

export default function MyRoutesPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <MyRoutesPageContent />
        </Suspense>
    );
}
