
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';
import { Suspense } from 'react';

function ItinerariesPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Itineraries</CardTitle>
                    <CardDescription>This feature is coming soon.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center py-20">
                     <div className="p-4 bg-muted rounded-full mb-4">
                        <Map className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">Route Planning & Itineraries</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        Soon, you'll be able to create and manage multi-stop itineraries, optimize routes, and provide detailed travel plans for your clients right here.
                    </p>
                    <Button className="mt-6">Notify Me</Button>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function ItinerariesPage(){
    return (
        <Suspense>
            <ItinerariesPageContent />
        </Suspense>
    )
}
