
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Shield } from 'lucide-react';

function InsurancePageContent() {
    return (
        <AppLayout>
            <div className="space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield />
                            Insurance Partners
                        </CardTitle>
                        <CardDescription>This page is where insurance products would be displayed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Insurance partner content has been removed.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default function InsurancePage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <InsurancePageContent />
        </Suspense>
    )
}
