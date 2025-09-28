

"use client";

import { AppLayout } from '@/components/layout/app-layout';
import MyRoutes from '@/components/dashboard/my-routes';
import { getRoutes, getCurrentUser } from '@/lib/storage';
import type { Route } from '@/lib/types';
import { Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';


export default function MyRoutesPage() {
    const searchParams = useSearchParams();
    const bookingIdFromUrl = searchParams.get('booking_id');
    const [initialRoutes, setInitialRoutes] = useState<Route[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            const userEmail = getCurrentUser();
            let routes: Route[] = [];
            if (userEmail) {
                routes = await getRoutes(false, { ownerEmail: userEmail });
            }
            setInitialRoutes(routes);
            setIsLoading(false);
        };
        fetchInitialData();
    }, []);
    

    return (
        <AppLayout>
           <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }>
                {isLoading ? (
                     <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <MyRoutes routes={initialRoutes} bookingIdFromUrl={bookingIdFromUrl} />
                )}
           </Suspense>
        </AppLayout>
    );
}
