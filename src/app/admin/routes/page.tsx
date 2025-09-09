
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import MyRoutes from '@/components/dashboard/my-routes';
import { getRoutes } from '@/lib/storage';
import type { Route } from '@/lib/types';
import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import { format } from 'date-fns';

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

    const handleExport = () => {
        const dataToExport = routes.map(r => ({
            'Owner': r.ownerName,
            'Driver': r.driverName,
            'Driver Mobile': r.driverMobile,
            'From': r.fromLocation,
            'To': r.toLocation,
            'Date': format(new Date(r.travelDate), 'yyyy-MM-dd'),
            'Departure': r.departureTime,
            'Arrival': r.arrivalTime,
            'Seats': r.availableSeats,
            'Price': r.price,
            'Vehicle': r.vehicleType,
            'Vehicle Number': r.vehicleNumber,
        }));
        exportToCsv('all-routes.csv', dataToExport);
    }

    if (!isLoaded) {
        return <AppLayout><div>Loading all routes...</div></AppLayout>;
    }

    return (
        <AppLayout>
           <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Routes</CardTitle>
                        <CardDescription>A list of all routes created by all owners.</CardDescription>
                    </div>
                     <Button onClick={handleExport} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
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
