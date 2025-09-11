
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import Script from 'next/script';
import { MonitorPlay } from 'lucide-react';

function AdsPageContent() {
    const bannerAdScript = `
      atOptions = {
        'key' : '6563c4ab89bf446cc6ca2af6af14fc66',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;

    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <MonitorPlay /> Advertisement Space
                        </CardTitle>
                        <CardDescription>This page is dedicated to displaying various ad formats.</CardDescription>
                    </CardHeader>
                </Card>
                
                {/* Banner Ad 320x50 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Banner Ad (320x50)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex items-center justify-center">
                        <div>
                            <Script id="adsterra-banner-config" strategy="lazyOnload">
                                {bannerAdScript}
                            </Script>
                            <Script async={true} src="//exportseats.com/6563c4ab89bf446cc6ca2af6af14fc66/invoke.js" strategy="lazyOnload" />
                        </div>
                    </CardContent>
                </Card>

                {/* Native Banner Ad */}
                <Card>
                    <CardHeader>
                        <CardTitle>Native Banner Ad</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Script async={true} data-cfasync="false" src="//exportseats.com/143386acea5fdd4b99b856043235c82b/invoke.js" strategy="lazyOnload" />
                         <div id="container-143386acea5fdd4b99b856043235c82b"></div>
                    </CardContent>
                </Card>

                 {/* Social Bar Ad */}
                <Card>
                    <CardHeader>
                        <CardTitle>Social Bar Ad</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <Script type='text/javascript' src='//exportseats.com/18/6e/e8/186ee8d3ed422373beaa184909e3545c.js' strategy="lazyOnload" />
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
