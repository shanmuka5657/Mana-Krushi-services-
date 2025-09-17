
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { IndianRupee } from 'lucide-react';


function LoansPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><IndianRupee />Apply for a Loan</CardTitle>
                    <CardDescription>This page is where loan options would be displayed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Loan provider content has been removed.</p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function LoansPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <LoansPageContent />
        </Suspense>
    )
}
