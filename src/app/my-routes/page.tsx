
import { AppLayout } from '@/components/layout/app-layout';
import MyRoutes from '@/components/dashboard/my-routes';
import { getRoutes, getCurrentUser } from '@/lib/storage';
import type { Route } from '@/lib/types';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { headers } from 'next/headers';

// This page is now a Server Component. It fetches data on the server.
export default async function MyRoutesPage() {
    const heads = headers(); // Needed for searchParams to work in server components
    const searchParams = new URLSearchParams(heads.get('x-search-params') || '');
    const bookingIdFromUrl = searchParams.get('booking_id');
    
    // Data is fetched here on the server, before the page is sent to the client.
    // This is much faster than fetching in a useEffect hook on the client.
    const userEmail = getCurrentUser();
    let initialRoutes: Route[] = [];
    if (userEmail) {
        initialRoutes = await getRoutes(false, { ownerEmail: userEmail });
    }

    return (
        <AppLayout>
           <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }>
                {/* The MyRoutes component still handles the real-time updates,
                    but now it receives the initial data instantly from the server. */}
                <MyRoutes routes={initialRoutes} bookingIdFromUrl={bookingIdFromUrl} />
           </Suspense>
        </AppLayout>
    );
}
