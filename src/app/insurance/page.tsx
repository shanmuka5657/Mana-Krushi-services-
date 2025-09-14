
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { ChevronRight, Shield } from 'lucide-react';

const insuranceProviders = [
    {
        name: "Acko General Insurance",
        href: "https://www.acko.com/",
        description: "Digital-first insurer, ideal for embedded, per-trip coverage.",
        logoUrl: "https://i.ibb.co/3mSzzSGP/Screenshot-2025-09-14-12-37-47-041-com-whatsapp.jpg" // Placeholder
    },
    {
        name: "Digit Insurance",
        href: "https://www.godigit.com/",
        description: "Technology-driven insurer with simplified claims and on-demand products."
    },
    {
        name: "HDFC ERGO General Insurance",
        href: "https://www.hdfcergo.com/",
        description: "Trusted provider with a strong digital platform for partnerships."
    },
    {
        name: "ICICI Lombard",
        href: "https://www.icicilombard.com/",
        description: "One of India's leading private sector general insurance companies."
    }
];

function InsuranceProviderListItem({ name, href, description }: { name: string, href: string, description: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full group">
            <Card className="w-full transition-all hover:bg-muted/50 hover:shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-foreground">{name}</p>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                </CardContent>
            </Card>
        </a>
    )
}

function InsurancePageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield />
                        Insurance Partners
                    </CardTitle>
                    <CardDescription>Explore potential insurance providers suitable for ride-sharing platforms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {insuranceProviders.map(provider => (
                        <InsuranceProviderListItem key={provider.name} {...provider} />
                    ))}
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function InsurancePage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <InsurancePageContent />
        </Suspense>
    )
}
