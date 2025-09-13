"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Link as LinkIcon, ChevronRight } from 'lucide-react';

const smartLinks = [
    { id: "so1", name: "Special Offer 1", href: "https://exportseats.com/hyartub4x?key=d892b1670480ffb487d89b3817e5e7ac" },
    { id: "ed1", name: "Exclusive Deal 1", href: "https://exportseats.com/dh3vxuj481?key=b7533711b8862e5c235d94f55f71534a" },
    { id: "ed2", name: "Exclusive Deal 2", href: "https://exportseats.com/g0hq2kzg4?key=3dc62533b21bbb2a8759a09979857f8e" },
    { id: "so2", name: "Special Offer 2", href: "https://exportseats.com/m2jivq7i5?key=21be6efcb2e0598d5cc7a099cc5be61d" },
    { id: "lto", name: "Limited Time Offer", href: "https://exportseats.com/dpmz0i2c?key=7daf2adf8e65b73e02e8812c28801773" },
    { id: "so3", name: "Special Offer 3", href: "https://exportseats.com/qkjn3gymx?key=f37d577acabc18cde27215069997adf6" },
    { id: "so4", name: "Special Offer 4", href: "https://exportseats.com/cmpjkdem?key=29b9d93e0b8a07adb2edb7530ce75418" },
    { id: "so5", name: "Special Offer 5", href: "https://exportseats.com/jmnqe1gc?key=53755058a15fd950718897e97e84b512" },
    { id: "so6", name: "Special Offer 6", href: "https://exportseats.com/khjxsva4?key=e2f5f35bde660d3decfd60ad68291dc1" },
    { id: "so7", name: "Special Offer 7", href: "https://exportseats.com/yscmceke?key=325c6afc1d7d83b30524372aa1e584c4" },
    { id: "so8", name: "Special Offer 8", href: "https://exportseats.com/vp1ge6k02?key=c489b06da0cf1ceed18ed4d4ad470ee4" },
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

function SpecialOffer1Card() {
    const handleSpecialOfferClick = () => {
        const offer1 = smartLinks.find(link => link.id === 'so1');
        const offer2 = smartLinks.find(link => link.id === 'so2');
        const offer3 = smartLinks.find(link => link.id === 'so3');
        const offer4 = smartLinks.find(link => link.id === 'so4');
        const offer5 = smartLinks.find(link => link.id === 'so5');
        const offer6 = smartLinks.find(link => link.id === 'so6');
        const offer7 = smartLinks.find(link => link.id === 'so7');
        const offer8 = smartLinks.find(link => link.id === 'so8');

        if (offer1) window.open(offer1.href, '_blank');
        if (offer2) window.open(offer2.href, '_blank');
        if (offer3) window.open(offer3.href, '_blank');
        if (offer4) window.open(offer4.href, '_blank');
        if (offer5) window.open(offer5.href, '_blank');
        if (offer6) window.open(offer6.href, '_blank');
        if (offer7) window.open(offer7.href, '_blank');
        if (offer8) window.open(offer8.href, '_blank');
    };

    return (
         <div onClick={handleSpecialOfferClick} className="block w-full group cursor-pointer">
            <Card className="w-full transition-all hover:bg-muted/50 hover:shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <LinkIcon className="h-6 w-6 text-primary" />
                        <p className="font-semibold text-foreground">Special Offer 1</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                </CardContent>
            </Card>
        </div>
    );
}

function ExclusiveDeal1Card() {
    const handleExclusiveDealClick = () => {
        const deal1 = smartLinks.find(link => link.id === 'ed1');
        const deal2 = smartLinks.find(link => link.id === 'ed2');

        if (deal1) window.open(deal1.href, '_blank');
        if (deal2) window.open(deal2.href, '_blank');
    };

    return (
         <div onClick={handleExclusiveDealClick} className="block w-full group cursor-pointer">
            <Card className="w-full transition-all hover:bg-muted/50 hover:shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <LinkIcon className="h-6 w-6 text-primary" />
                        <p className="font-semibold text-foreground">Exclusive Deal 1</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                </CardContent>
            </Card>
        </div>
    );
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
                   {smartLinks.map((link) => {
                       if (link.id === 'so1') {
                           return <SpecialOffer1Card key={link.id} />;
                       }
                       // Don't render the other special offers individually if they are part of the chain
                       if (link.id.startsWith('so') && link.id !== 'so1') {
                           return null;
                       }
                        if (link.id === 'ed1') {
                           return <ExclusiveDeal1Card key={link.id} />;
                       }
                        if (link.id === 'ed2') {
                           return null;
                       }
                       return <SmartLinkCard key={link.id} name={link.name} href={link.href} />;
                   })}
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
