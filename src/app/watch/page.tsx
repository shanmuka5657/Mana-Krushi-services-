"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Video } from 'lucide-react';

function WatchPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Watch</CardTitle>
                    <CardDescription>This content has been removed.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center py-20">
                     <div className="p-4 bg-muted rounded-full mb-4">
                        <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">Content Removed</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        The embedded video has been removed from this page.
                    </p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function WatchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WatchPageContent />
        </Suspense>
    );
}
