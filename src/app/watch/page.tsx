
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useState, useEffect } from 'react';
import { Link as LinkIcon, TestTube2, Activity, ArrowDown, ArrowUp, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { perfTracker } from '@/lib/perf-tracker';

function PerfStat({ title, value, icon }: { title: string, value: number, icon: React.ElementType }) {
    const Icon = icon;
    return (
        <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-muted-foreground" />
                <span className="font-medium">{title}</span>
            </div>
            <span className="font-mono text-xl font-bold">{value}</span>
        </div>
    );
}

function WatchPageContent() {
    const { toast } = useToast();
    const [perfCounts, setPerfCounts] = useState({ reads: 0, writes: 0 });

    useEffect(() => {
        const unsubscribe = perfTracker.subscribe(setPerfCounts);
        return () => unsubscribe();
    }, []);

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

    const handleReset = () => {
        perfTracker.reset();
        toast({
            title: "Performance Counters Reset",
            description: "Read and write counts for this session have been reset to zero."
        });
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity />
                            Performance Tracker
                        </CardTitle>
                        <CardDescription>
                            Live client-side database operations for this session. This tool helps diagnose performance issues.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <PerfStat title="Database Reads" value={perfCounts.reads} icon={ArrowDown} />
                        <PerfStat title="Database Writes" value={perfCounts.writes} icon={ArrowUp} />
                         <Button onClick={handleReset} variant="outline" className="w-full">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Reset Counters
                        </Button>
                    </CardContent>
                </Card>

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
            </div>
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
