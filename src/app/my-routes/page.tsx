
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
        // We will now fetch routes inside the MyRoutes component based on filters.
        // This initial fetch is no longer needed.
        const fetchInitialData = async () => {
            const ownerName = getCurrentUserName();
            if (ownerName) {
                const allRoutes = await getRoutes();
                const ownerRoutes = allRoutes.filter(r => r.ownerName === ownerName);
                setRoutes(ownerRoutes);
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
