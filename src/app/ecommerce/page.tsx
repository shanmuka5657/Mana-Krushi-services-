
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { ShoppingCart } from 'lucide-react';

function EcommercePageContent() {
    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>E-commerce Partners</CardTitle>
                        <CardDescription>
                            This page is where partner offers would be displayed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <p className="text-muted-foreground">Partner content has been removed.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default function EcommercePage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <EcommercePageContent />
        </Suspense>
    )
}
