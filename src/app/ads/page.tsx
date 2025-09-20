
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

        return () => {
            // Attempt to clean up if the component unmounts. This is best-effort.
            const adScript1 = document.querySelector('script[src="https://groleegni.net/vignette.min.js"]');
            if (adScript1) {
                // The script removes itself, but we can try to clean up the container if it's identifiable.
            }
            const adScript2 = document.querySelector('script[src="https://al5sm.com/tag.min.js"]');
             if (adScript2) {
                // The script removes itself, but we can try to clean up the container if it's identifiable.
            }
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
