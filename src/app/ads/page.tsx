
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import Script from 'next/script';
import { MonitorPlay, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    
    const banner468x60Script = `
      atOptions = {
		'key' : 'c6669511fdc1c44d2ff58fb29647cc91',
		'format' : 'iframe',
		'height' : 60,
		'width' : 468,
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

                {/* Banner Ad 468x60 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Banner Ad (468x60)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex items-center justify-center">
                        <div>
                            <Script id="adsterra-banner-468-config" strategy="lazyOnload">
                                {banner468x60Script}
                            </Script>
                            <Script async={true} src="//exportseats.com/c6669511fdc1c44d2ff58fb29647cc91/invoke.js" strategy="lazyOnload" />
                        </div>
                    </CardContent>
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
                
                {/* Direct Link Ad */}
                <Card>
                    <CardHeader>
                        <CardTitle>Direct Link Ad</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <a href="https://exportseats.com/m2jivq7i5?key=21be6efcb2e0598d5cc7a099cc5be61d" target="_blank" rel="noopener noreferrer">
                            <Button className="w-full">
                                <Link className="mr-2 h-4 w-4" />
                                Click to View Offer
                            </Button>
                        </a>
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
