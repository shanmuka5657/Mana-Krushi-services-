"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Link as LinkIcon, ChevronRight } from 'lucide-react';

const smartLinks = [
    { name: "Special Offer 1", href: "https://exportseats.com/hyartub4x?key=d892b1670480ffb487d89b3817e5e7ac" },
    { name: "Exclusive Deal 1", href: "https://exportseats.com/dh3vxuj481?key=b7533711b8862e5c235d94f55f71534a" },
    { name: "Exclusive Deal 2", href: "https://exportseats.com/g0hq2kzg4?key=3dc62533b21bbb2a8759a09979857f8e" },
    { name: "Special Offer 2", href: "https://exportseats.com/m2jivq7i5?key=21be6efcb2e0598d5cc7a099cc5be61d" },
    { name: "Limited Time Offer", href: "https://exportseats.com/dpmz0i2c?key=7daf2adf8e65b73e02e8812c28801773" },
    { name: "Special Offer 3", href: "https://exportseats.com/qkjn3gymx?key=f37d577acabc18cde27215069997adf6" },
];

function SmartLinkCard({ name, href }: { name: string, href: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full group">
            <Card className="w-full transition-all hover:bg-muted/50 hover:shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <LinkIcon className="h-6 w-6 text-primary" />
                        <p className="font-semibold text-foreground">{name}</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                </CardContent>
            </Card>
        </a>
    )
}

function WatchPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Special Offers & Deals</CardTitle>
                    <CardDescription>Explore these exclusive links.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                   {smartLinks.map((link) => (
                       <SmartLinkCard key={link.href} name={link.name} href={link.href} />
                   ))}
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function WatchPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <WatchPageContent />
        </Suspense>
    );
}
