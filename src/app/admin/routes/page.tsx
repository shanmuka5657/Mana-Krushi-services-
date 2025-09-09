
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import MyRoutes from '@/components/dashboard/my-routes';
import { getRoutes } from '@/lib/storage';
import type { Route } from '@/lib/types';
import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function AdminAllRoutesPage() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchRoutes = async () => {
            const allRoutes = await getRoutes(true); // Pass true for admin
            allRoutes.sort((a, b) => new Date(b.travelDate).getTime() - new Date(a.travelDate).getTime());
            setRoutes(allRoutes);
            setIsLoaded(true);
        };
        fetchRoutes();
    }, []);


    if (!isLoaded) {
        return <AppLayout><div>Loading all routes...</div></AppLayout>;
    }

    return (
        <AppLayout>
           <Card>
                <CardHeader>
                    <CardTitle>All Routes</CardTitle>
                    <CardDescription>A list of all routes created by all owners.</CardDescription>
                </CardHeader>
           </Card>
           <MyRoutes routes={routes} />
        </AppLayout>
    );
}

export default function AllRoutesPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <AdminAllRoutesPage />
        </Suspense>
    );
}
