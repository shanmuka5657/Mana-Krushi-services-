
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getBookings } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { AlertCircle, Calendar, User, Car } from 'lucide-react';
import { Suspense } from 'react';

function AdminReportsPage() {
    const [reports, setReports] = useState<Booking[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            const allBookings = await getBookings(true);
            const allReports = allBookings
                .filter(b => b.report)
                .sort((a,b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());
            
            setReports(allReports);
            setIsLoaded(true);
        };
        fetchReports();
    }, []);

    if (!isLoaded) {
        return <AppLayout><div>Loading reports...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>All Passenger Reports</CardTitle>
                    <CardDescription>
                        Anonymous feedback from passengers across the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {reports.length > 0 ? reports.map(report => (
                        <div key={report.id} className="border p-4 rounded-lg">
                            <div className="flex flex-wrap justify-between items-center mb-2 gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2 font-mono">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Report for Booking {report.bookingCode || report.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(new Date(report.departureDate), 'PPP')}</span>
                                </div>
                            </div>
                            <p className="text-foreground bg-muted/50 p-3 rounded-md">{report.report}</p>
                            <div className="flex flex-wrap justify-between items-center mt-3 gap-2 text-xs text-muted-foreground pt-2 border-t">
                                <div className="flex items-center gap-2" title="Passenger">
                                    <User className="h-3 w-3" />
                                    <span>{report.client}</span>
                                </div>
                                 <div className="flex items-center gap-2" title="Owner">
                                    <Car className="h-3 w-3" />
                                    <span>{report.driverName}</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-muted-foreground py-12">
                            <AlertCircle className="mx-auto h-12 w-12" />
                            <h3 className="mt-4 text-lg font-medium">No Reports Found</h3>
                            <p className="mt-1 text-sm">
                                There is no feedback from passengers at this time.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <AdminReportsPage />
        </Suspense>
    )
}
