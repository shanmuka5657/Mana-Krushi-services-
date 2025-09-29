
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import MyRoutes from '@/components/dashboard/my-routes';
import { getRoutes, getCurrentUser } from '@/lib/storage';
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
