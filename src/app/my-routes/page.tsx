
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import MyRoutes from '@/components/dashboard/my-routes';
import { getRoutes, getCurrentUserName, getCurrentUser } from '@/lib/storage';
import type { Route } from '@/lib/types';
import { Suspense } from 'react';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';

function MyRoutesPageContent() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            const ownerEmail = getCurrentUser();
            if (ownerEmail) {
                // Fetch only the routes for the current owner
                const ownerRoutes = await getRoutes(false, { ownerEmail });
                
                // Default filter: today and tomorrow
                const today = startOfDay(new Date());
                const tomorrow = endOfDay(addDays(new Date(), 1));

                const defaultRoutes = ownerRoutes.filter(r => {
                    const routeDate = new Date(r.travelDate);
                    return routeDate >= today && routeDate <= tomorrow;
                });
                
                setRoutes(defaultRoutes.sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime()));
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
