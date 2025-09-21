
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useEffect } from 'react';
import { MonitorPlay } from 'lucide-react';

function AdsPageContent() {

    useEffect(() => {
        const scriptId = 'popup-ad-script-8d625f';
        
        // Prevent script from being added more than once
        if (document.getElementById(scriptId)) {
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'text/javascript';
        script.src = '//markswaitingrouge.com/8d/62/5f/8d625f6c0ee1cd63f181069e4d8bab94.js';
        
        document.body.appendChild(script);

        // Cleanup the script when the component unmounts
        return () => {
            const existingScript = document.getElementById(scriptId);
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, []);


    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <MonitorPlay /> Advertisement Space
                        </CardTitle>
                        <CardDescription>This space is available for advertisements. The pop-up ad script is active on this page.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="flex justify-center items-center bg-muted rounded-md min-h-[100px]">
                           <p className="text-muted-foreground">Ad content area.</p>
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
