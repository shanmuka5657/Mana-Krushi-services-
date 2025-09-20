
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useEffect } from 'react';
import { MonitorPlay } from 'lucide-react';

function AdsPageContent() {
    useEffect(() => {
        // First ad script
        const script1 = document.createElement('script');
        script1.innerHTML = `(function(s){s.dataset.zone='9892027',s.src='https://groleegni.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
        document.body.appendChild(script1);

        // Second ad script
        const script2 = document.createElement('script');
        script2.innerHTML = `(function(s){s.dataset.zone='9892058',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
        document.body.appendChild(script2);
        
        // Third ad script
        const script3 = document.createElement('script');
        script3.innerHTML = `(function(s){s.dataset.zone='9904124',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
        document.body.appendChild(script3);

        return () => {
            // Cleanup is best-effort as these scripts often self-remove or don't provide cleanup handlers.
        }
    }, []);

    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <MonitorPlay /> Advertisement Space
                        </CardTitle>
                        <CardDescription>This space is available for advertisements.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div id="ad-container" className="flex justify-center items-center bg-muted rounded-md min-h-[100px]">
                           {/* The ad script will populate this or other areas. */}
                           <p className="text-muted-foreground">Ad content will be displayed here.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default function AdsPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <AdsPageContent />
        </Suspense>
    );
}
