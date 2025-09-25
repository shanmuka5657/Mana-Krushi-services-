
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { MessageSquare, Construction } from 'lucide-react';

function MessagesPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare />
                        Messages
                    </CardTitle>
                    <CardDescription>This feature is currently under development.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center py-12">
                    <Construction className="h-16 w-16 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">Real-Time Chat Coming Soon!</h3>
                    <p className="mt-2 text-muted-foreground max-w-xl">
                        We are building a powerful in-app messaging system that will allow passengers and owners to communicate directly. You will be able to manage all your conversations right here.
                    </p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <MessagesPageContent />
        </Suspense>
    );
}
