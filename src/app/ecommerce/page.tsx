
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Suspense } from 'react';
import { CreditCard } from 'lucide-react';

function EcommercePageContent() {
    const cardOffer = {
        name: "HSBC Platinum Credit Card",
        imageUrl: "https://picsum.photos/seed/hsbccard/600/378",
        imageHint: "credit card",
        features: [
            "No joining fee",
            "3X reward points on dining, hotels, and telecom",
            "Up to 15% discount at over 1,000 restaurants",
            "Fuel surcharge waiver",
        ],
        applyUrl: "https://bitli.in/cbX2s28"
    };

    return (
        <AppLayout>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>E-commerce Offers</CardTitle>
                    <CardDescription>Exclusive offers curated just for you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <a href={cardOffer.applyUrl} target="_blank" rel="noopener noreferrer" className="block group">
                        <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                             <CardHeader className="flex flex-row items-start bg-muted/50">
                                <div className="space-y-1.5">
                                <CardTitle>{cardOffer.name}</CardTitle>
                                <CardDescription>Unlock a world of rewards and benefits.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Image
                                    src={cardOffer.imageUrl}
                                    alt={cardOffer.name}
                                    width={600}
                                    height={378}
                                    className="w-full h-auto object-cover"
                                    data-ai-hint={cardOffer.imageHint}
                                />
                                <div className="p-6 space-y-4">
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {cardOffer.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <CreditCard className="mr-2 h-4 w-4 text-green-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="w-full group-hover:bg-primary/90">Apply Now</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function EcommercePage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <EcommercePageContent />
        </Suspense>
    )
}
