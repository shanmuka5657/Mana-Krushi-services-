
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map } from 'lucide-react';

export default function TrackRidePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-muted/20">
            <header className="bg-background shadow-sm p-4 flex items-center gap-4 sticky top-0 z-40">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold">Live Ride Status</h1>
            </header>
            
            <main className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Feature Not Available</CardTitle>
                        <CardDescription>Live map tracking has been temporarily removed.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center py-20">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <Map className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">Map Feature Under Maintenance</h3>
                        <p className="text-muted-foreground mt-2 max-w-md">
                            We are currently working on improving our live tracking feature. Please check back later.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
