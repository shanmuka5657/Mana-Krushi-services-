
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import MyRoutes from '@/components/dashboard/my-routes';
import type { Route } from '@/lib/types';
import { Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';


function MyRoutesPageContent() {
    const searchParams = useSearchParams();
    const bookingIdFromUrl = searchParams.get('booking_id');
    const [initialRoutes, setInitialRoutes] = useState<Route[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // This logic is now safe because the component only runs on the client.
        const fetchInitialData = async () => {
            const { getRoutes, getCurrentUser } = await import('@/lib/storage');
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return <MyRoutes routes={initialRoutes} bookingIdFromUrl={bookingIdFromUrl} />;
}

const DynamicMyRoutesPage = dynamic(() => Promise.resolve(MyRoutesPageContent), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});


export default function MyRoutesPage() {
    return (
        <AppLayout>
           <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }>
                <DynamicMyRoutesPage />
           </Suspense>
        </AppLayout>
    );
}
