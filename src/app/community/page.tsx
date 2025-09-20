
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Users } from 'lucide-react';

function CommunityPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users />
                        Community Spotlight
                    </CardTitle>
                    <CardDescription>
                        Featuring top influencers and their social media feeds. This space is ready for integration.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <div className="p-8 text-center border-2 border-dashed rounded-lg">
                        <p>Embedded social media content (e.g., X, Instagram, YouTube) will be displayed here.</p>
                    </div>
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
