
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { MessageSquare, Rss } from 'lucide-react';

function MessagingCampaignsPage() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Rss />
                        Notification Campaigns
                    </CardTitle>
                    <CardDescription>This feature is currently under development.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center py-12">
                    <MessageSquare className="h-16 w-16 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">Automated Notifications Coming Soon!</h3>
                    <p className="mt-2 text-muted-foreground">
                        We are building a powerful system to send automated, intelligent notifications (like morning commute suggestions) to users via push notifications.
                    </p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function MessagingPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <MessagingCampaignsPage />
        </Suspense>
    );
}
