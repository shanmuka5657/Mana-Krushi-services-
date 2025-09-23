
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Construction, Database } from 'lucide-react';

function DatabaseUnderConstructionPage() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database />
                        Database Management
                    </CardTitle>
                    <CardDescription>This feature is currently being developed.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center py-12">
                    <Construction className="h-16 w-16 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">Coming Soon!</h3>
                    <p className="mt-2 text-muted-foreground">
                        Tools for direct database management and data migration will be available here shortly.
                    </p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function DatabasePage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <DatabaseUnderConstructionPage />
        </Suspense>
    );
}
