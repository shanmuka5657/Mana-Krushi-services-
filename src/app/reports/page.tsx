
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getBookings, getCurrentUserName, getCurrentUser } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { AlertCircle, Calendar } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ReportsPageContent() {
    const [reports, setReports] = useState<Booking[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'passenger';

    useEffect(() => {
        const allBookings = getBookings();
        let userReports: Booking[] = [];
        if(role === 'owner') {
            const ownerName = getCurrentUserName();
            userReports = allBookings.filter(b => b.driverName === ownerName && b.report);
        } else {
            const clientName = getCurrentUserName();
            userReports = allBookings.filter(b => b.client === clientName && b.report);
        }
        
        setReports(userReports.sort((a,b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime()));
        setIsLoaded(true);

    }, [role]);

    if (!isLoaded) {
        return <AppLayout><div>Loading reports...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>
                        {role === 'owner' ? 'Anonymous feedback from passengers.' : 'A history of reports you have submitted.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {reports.length > 0 ? reports.map(report => (
                        <div key={report.id} className="border p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Report for Booking {report.id}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(new Date(report.departureDate), 'PPP')}</span>
                                </div>
                            </div>
                            <p className="text-foreground">{report.report}</p>
                             {role === 'passenger' && (
                                <p className="text-xs text-muted-foreground mt-2">Submitted by you.</p>
                            )}
                        </div>
                    )) : (
                        <div className="text-center text-muted-foreground py-12">
                            <AlertCircle className="mx-auto h-12 w-12" />
                            <h3 className="mt-4 text-lg font-medium">No Reports Found</h3>
                            <p className="mt-1 text-sm">
                                {role === 'owner' 
                                    ? "There is no feedback from passengers at this time." 
                                    : "You have not submitted any reports."}
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
        <Suspense>
            <ReportsPageContent />
        </Suspense>
    )
}
