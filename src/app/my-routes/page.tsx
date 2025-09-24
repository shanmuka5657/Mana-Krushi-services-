
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import MyRoutes from '@/components/dashboard/my-routes';
import { getRoutes, getCurrentUser } from '@/lib/storage';
import type { Route } from '@/lib/types';
import { Suspense } from 'react';

function MyRoutesPageContent() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            const ownerEmail = getCurrentUser();
            if (ownerEmail) {
                // Fetch only the routes for the current owner
                const ownerRoutes = await getRoutes(false, { ownerEmail });
                
                // Show all routes, sorted by most recent first
                setRoutes(ownerRoutes.sort((a, b) => new Date(b.travelDate).getTime() - new Date(a.travelDate).getTime()));
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
