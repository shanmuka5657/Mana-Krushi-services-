
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';

function WatchPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Embedded Video</CardTitle>
                    <CardDescription>Here's an example of how you can display a video in your app.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video w-full overflow-hidden rounded-lg border">
                        <video 
                            controls 
                            src="https://www.w3schools.com/html/mov_bbb.mp4" 
                            className="w-full h-full object-cover"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This is a sample video. You can replace the `src` attribute with a link to your own video file (e.g., from a hosting service or your own storage).
                    </p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function WatchPage() {
    return (
        <Suspense>
            <WatchPageContent />
        </Suspense>
    );
}
