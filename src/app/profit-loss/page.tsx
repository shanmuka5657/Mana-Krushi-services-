
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Construction } from 'lucide-react';


function ProfitLossPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <AppLayout>
                <Card>
                    <CardHeader>
                        <CardTitle>Profit & Loss Statement</CardTitle>
                        <CardDescription>This feature is temporarily unavailable.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center py-12">
                        <Construction className="h-16 w-16 text-muted-foreground" />
                        <h3 className="mt-4 text-xl font-semibold">Coming Soon!</h3>
                        <p className="mt-2 text-muted-foreground">
                            The Profit & Loss feature is currently under development and will be available in a future update.
                        </p>
                    </CardContent>
                </Card>
            </AppLayout>
        </Suspense>
    );
}

export default ProfitLossPage;
