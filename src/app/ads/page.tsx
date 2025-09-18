
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useEffect, useState } from 'react';
import { MonitorPlay, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';
import { getCurrentUserRole } from '@/lib/storage';

function AdsPageContent() {
    const { adBanner1 } = placeholderImages;
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const role = getCurrentUserRole();
        setIsAdmin(role === 'admin');
    }, []);

    if (isAdmin) {
        return (
            <AppLayout>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert /> Ads Disabled for Admin
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Advertisements are hidden for administrators to provide a clean user experience.
                        </p>
                    </CardContent>
                </Card>
            </AppLayout>
        );
    }


    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <MonitorPlay /> Advertisement Space
                        </CardTitle>
                        <CardDescription>This page is where ad components like banners can be displayed.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="flex justify-center">
                           <a href="https://groleegni.net/p/9892027" target="_blank" rel="noopener noreferrer">
                                <Image
                                    src={`https://picsum.photos/seed/${adBanner1.seed}/${adBanner1.width}/${adBanner1.height}`}
                                    alt="Advertisement Banner"
                                    width={adBanner1.width}
                                    height={adBanner1.height}
                                    data-ai-hint={adBanner1.hint}
                                    className="rounded-md"
                                />
                            </a>
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
