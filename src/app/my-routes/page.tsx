
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
            
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Start of today

            // Filter for upcoming routes
            const upcomingRoutes = ownerRoutes
                .filter(r => new Date(r.travelDate) >= now)
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
