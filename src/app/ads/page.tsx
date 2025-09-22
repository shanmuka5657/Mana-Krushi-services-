"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useEffect, useState } from 'react';
import { MonitorPlay } from 'lucide-react';
import { onAdsEnabledChange } from '@/lib/storage';

function AdsPageContent() {
    const [areAdsEnabled, setAreAdsEnabled] = useState(false);

    useEffect(() => {
        const unsub = onAdsEnabledChange(setAreAdsEnabled);
        return () => unsub();
    }, []);


    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <MonitorPlay /> Advertisement Space
                        </CardTitle>
                        <CardDescription>
                            This space is available for advertisements. Ad visibility is controlled by the admin in the Entertainment section.
                        </CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="flex justify-center items-center bg-muted rounded-md min-h-[100px]">
                           {areAdsEnabled ? (
                                <p className="text-muted-foreground">Advertisement content would be displayed here.</p>
                           ) : (
                                <p className="text-muted-foreground">Ads are currently disabled by the administrator.</p>
                           )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default function AdsPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <AdsPageContent />
        </Suspense>
    );
}
