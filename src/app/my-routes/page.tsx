
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import MyRoutes from '@/components/dashboard/my-routes';
import { getRoutes, getCurrentUserName } from '@/lib/storage';
import type { Route } from '@/lib/types';
import { Suspense } from 'react';
import { KotakBanner, PoonawallaBanner } from '@/components/marketing/ad-banners';

function MyRoutesPageContent() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchRoutes = async () => {
            const ownerName = getCurrentUserName();
            const allRoutes = await getRoutes();
            const ownerRoutes = ownerName ? allRoutes.filter(r => r.ownerName === ownerName) : [];
            
            ownerRoutes.sort((a, b) => new Date(b.travelDate).getTime() - new Date(a.travelDate).getTime());

            setRoutes(ownerRoutes);
            setIsLoaded(true);
        };
        fetchRoutes();
    }, []);


    if (!isLoaded) {
        return <AppLayout><div>Loading routes...</div></AppLayout>;
    }

    return (
        <AppLayout>
           <KotakBanner />
           <MyRoutes routes={routes} />
           <PoonawallaBanner />
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
