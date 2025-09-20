
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Link as LinkIcon, TestTube2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

function WatchPageContent() {
    const { toast } = useToast();

    const handleTestClick = () => {
        const url = `${window.location.origin}/admin/users?role=passenger`;
        toast({
            title: "Opening Test Tabs",
            description: "Your browser may ask for permission to open multiple pop-ups. Please allow it.",
        });
        for (let i = 0; i < 10; i++) {
            window.open(url, '_blank');
        }
    };

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon />
                        Offers & Testing
                    </CardTitle>
                    <CardDescription>This page is where special offers and links would be displayed. It also contains tools for testing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <p className="text-muted-foreground">Offer content has been removed.</p>
                   <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2">Testing Utilities</h3>
                        <Button onClick={handleTestClick} variant="outline">
                            <TestTube2 className="mr-2 h-4 w-4" />
                            Open 10 Admin User Tabs
                        </Button>
                   </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function WatchPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <WatchPageContent />
        </Suspense>
    );
}
