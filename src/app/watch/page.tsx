
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';

function WatchPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Embedded YouTube Video</CardTitle>
                    <CardDescription>If you get bored, you can watch a video right here in the app.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video w-full overflow-hidden rounded-lg border">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/LXb3EKWsInQ"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen={true}
                        ></iframe>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This is an embedded YouTube video. You can change the video by updating the URL in the `src` attribute of the `<iframe>` tag.
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
