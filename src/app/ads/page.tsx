
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { MonitorPlay } from 'lucide-react';

function AdsPageContent() {
    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <MonitorPlay /> Advertisement Space
                        </CardTitle>
                        <CardDescription>This page is where ad components would be displayed.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <p className="text-muted-foreground">Ad content has been removed.</p>
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
