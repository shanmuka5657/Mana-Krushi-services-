
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import MyRoutes from '@/components/dashboard/my-routes';
import { getRoutes, getCurrentUserName } from '@/lib/storage';
import type { Route } from '@/lib/types';
import { Suspense } from 'react';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';

function MyRoutesPageContent() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            const ownerName = getCurrentUserName();
            if (ownerName) {
                const allRoutes = await getRoutes();
                const ownerRoutes = allRoutes.filter(r => r.ownerName === ownerName);
                
                // Default filter: today and tomorrow
                const today = startOfDay(new Date());
                const tomorrow = endOfDay(addDays(new Date(), 1));

                const defaultRoutes = ownerRoutes.filter(r => {
                    const routeDate = new Date(r.travelDate);
                    return routeDate >= today && routeDate <= tomorrow;
                });
                
                setRoutes(defaultRoutes);
            }
            setIsLoaded(true);
        };
        fetchInitialData();
    }, []);


    if (!isLoaded) {
        return <AppLayout><div>Loading...</div></AppLayout>;
    }

    return (
        <AppLayout>
           <MyRoutes routes={routes} />
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
