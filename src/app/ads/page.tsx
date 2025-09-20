
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useEffect } from 'react';
import { MonitorPlay } from 'lucide-react';

function AdsPageContent() {
    useEffect(() => {
        const script = document.createElement('script');
        script.innerHTML = `(function(s){s.dataset.zone='9892027',s.src='https://groleegni.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
        document.body.appendChild(script);

        return () => {
            // Attempt to clean up if the component unmounts, though this specific script might not be easily removable.
            // This is best-effort cleanup.
            const adScript = document.querySelector('script[src="https://groleegni.net/vignette.min.js"]');
            if (adScript) {
                document.body.removeChild(adScript);
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
