
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';


function CommunityPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users />
                        Community Hub
                    </CardTitle>
                    <CardDescription>
                        This section is under development and will host future community and automated notification features.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The "Find Bikers" feature has been removed to make way for a more advanced, automated notification system that will suggest rides to you. Stay tuned!</p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function CommunityPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <CommunityPageContent />
        </Suspense>
    );
}
