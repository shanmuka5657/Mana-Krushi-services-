
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Link as LinkIcon } from 'lucide-react';

function WatchPageContent() {

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon />
                        Offers
                    </CardTitle>
                    <CardDescription>This page is where special offers and links would be displayed.</CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">Offer content has been removed.</p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function WatchPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <WatchPageContent />
        </Suspense>
    );
}
