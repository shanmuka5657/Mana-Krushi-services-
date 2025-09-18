
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { MonitorPlay } from 'lucide-react';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

function AdsPageContent() {
    const { adBanner1 } = placeholderImages;

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
