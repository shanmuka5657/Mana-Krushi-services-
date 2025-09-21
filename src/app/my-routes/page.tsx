
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import MyRoutes from '@/components/dashboard/my-routes';
import { getRoutes, getCurrentUserName } from '@/lib/storage';
import type { Route } from '@/lib/types';
import { Suspense } from 'react';

function MyRoutesPageContent() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchRoutes = async () => {
            const ownerName = getCurrentUserName();
            const allRoutes = await getRoutes();
            const ownerRoutes = ownerName ? allRoutes.filter(r => r.ownerName === ownerName) : [];
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const endOfTomorrow = new Date(tomorrow);
            endOfTomorrow.setHours(23, 59, 59, 999);

            // Filter for routes that are today or tomorrow
            const upcomingRoutes = ownerRoutes
                .filter(r => {
                    const routeDate = new Date(r.travelDate);
                    return routeDate >= today && routeDate <= endOfTomorrow;
                })
                .sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime());

            setRoutes(upcomingRoutes);
            setIsLoaded(true);
        };
        fetchRoutes();
    }, []);


    if (!isLoaded) {
        return <AppLayout><div>Loading routes...</div></AppLayout>;
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
