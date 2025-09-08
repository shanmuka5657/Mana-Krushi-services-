
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
        const ownerName = getCurrentUserName();
        const allRoutes = getRoutes();
        // In a real app, you'd fetch this from a server based on owner ID
        const ownerRoutes = allRoutes.filter(r => r.ownerName === ownerName || r.driverName === ownerName);
        
        // Sort routes by date, newest first
        ownerRoutes.sort((a, b) => new Date(b.travelDate).getTime() - new Date(a.travelDate).getTime());

        setRoutes(ownerRoutes);
        setIsLoaded(true);
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
        <Suspense fallback={<div>Loading...</div>}>
            <MyRoutesPageContent />
        </Suspense>
    );
}
