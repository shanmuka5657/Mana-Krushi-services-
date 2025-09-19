
"use client";

import { useState, useEffect, Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getVisitorCount } from '@/lib/storage';
import { Eye, Loader2 } from 'lucide-react';

function AdminVisitorsPage() {
    const [visitorCount, setVisitorCount] = useState<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchCount = async () => {
            const count = await getVisitorCount();
            setVisitorCount(count);
            setIsLoaded(true);
        };
        fetchCount();
    }, []);

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Total Visitors</CardTitle>
                    <CardDescription>The total number of unique visits to the application.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-20">
                    {isLoaded ? (
                        <div className="text-center">
                            <Eye className="h-16 w-16 mx-auto text-muted-foreground" />
                            <div className="mt-4 text-6xl font-bold">
                                {visitorCount !== null ? visitorCount.toLocaleString() : '0'}
                            </div>
                            <p className="text-muted-foreground">Total Visitors</p>
                        </div>
                    ) : (
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function VisitorsPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <AdminVisitorsPage />
        </Suspense>
    );
}
