
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Link as LinkIcon, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';


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
    { id: "so9", name: "Special Offer 9", href: "https://exportseats.com/krm37igh?key=c7763dda3bed41d5ec713d55160ce80b" },
];

const bestOffers = [
    { name: "Smartlink_8", href: "https://exportseats.com/khjxsva4?key=e2f5f35bde660d3decfd60ad68291dc1" },
    { name: "Smartlink_6", href: "https://exportseats.com/cmpjkdem?key=29b9d93e0b8a07adb2edb7530ce75418" },
    { name: "Smartlink_20", href: "https://exportseats.com/g7cwyrik?key=03a95b8789ff420064cca469e6e0d8d3" },
    { name: "Smartlink_11", href: "https://exportseats.com/krm37igh?key=c7763dda3bed41d5ec713d55160ce80b" },
    { name: "Smartlink_16", href: "https://exportseats.com/sb4j0zvt?key=3a41f3bde6ddfae280c3822b2368bc6c" },
    { name: "Smartlink_14", href: "https://exportseats.com/pif8hc06e3?key=806a5ce2c19b5b4e9dc48141dfc476dd" },
    { name: "Smartlink_10", href: "https://exportseats.com/vp1ge6k02?key=c489b06da0cf1ceed18ed4d4ad470ee4" },
    { name: "Smartlink_9", href: "https://exportseats.com/yscmceke?key=325c6afc1d7d83b30524372aa1e584c4" },
    { name: "Smartlink_19", href: "https://exportseats.com/cg9hjv2957?key=aa535d9cefc044de0c3f116f9fc0df30" },
    { name: "Smartlink_13", href: "https://exportseats.com/yhpbyr1hc0?key=121375fe1b6d287983723ef859ac6d7d" },
    { name: "Smartlink_7", href: "https://exportseats.com/jmnqe1gc?key=53755058a15fd950718897e97e84b512" },
    { name: "Smartlink_17", href: "https://exportseats.com/ridvqpvr7?key=270c4065b81c3e649f001d289f315113" },
    { name: "Smartlink_15", href: "https://exportseats.com/qyy895we?key=cdd8d956b2f9b5f1260f3d939a32116c" },
    { name: "Smartlink_12", href: "https://exportseats.com/tzshk4sn?key=6497b840915a8293b880426b63b520d9" },
    { name: "Smartlink_18", href: "https://exportseats.com/rrch2di8?key=2ea9f6e97d4f2313dbd9d0ec759a10db" },
    { name: "Smartlink_1", href: "https://exportseats.com/dh3vxuj481?key=b7533711b8862e5c235d94f55f71534a" },
    { name: "Smartlink_2", href: "https://exportseats.com/g0hq2kzg4?key=3dc62533b21bbb2a8759a09979857f8e" },
    { name: "Smartlink_4", href: "https://exportseats.com/m2jivq7i5?key=21be6efcb2e0598d5cc7a099cc5be61d" },
    { name: "Smartlink_3", href: "https://exportseats.com/dpmz0i2c?key=7daf2adf8e65b73e02e8812c28801773" },
    { name: "Smartlink_5", href: "https://exportseats.com/qkjn3gymx?key=f37d577acabc18cde27215069997adf6" },
];

const bumperOffers = [
    { name: 'Bumper Offer 1', href: 'https://exportseats.com/khjxsva4?key=e2f5f35bde660d3decfd60ad68291dc1' },
    { name: 'Bumper Offer 2', href: 'https://exportseats.com/cmpjkdem?key=29b9d93e0b8a07adb2edb7530ce75418' },
    { name: 'Bumper Offer 3', href: 'https://exportseats.com/g7cwyrik?key=03a95b8789ff420064cca469e6e0d8d3' },
    { name: 'Bumper Offer 4', href: 'https://exportseats.com/krm37igh?key=c7763dda3bed41d5ec713d55160ce80b' },
    { name: 'Bumper Offer 5', href: 'https://exportseats.com/sb4j0zvt?key=3a41f3bde6ddfae280c3822b2368bc6c' },
    { name: 'Bumper Offer 6', href: 'https://exportseats.com/pif8hc06e3?key=806a5ce2c19b5b4e9dc48141dfc476dd' },
    { name: 'Bumper Offer 7', href: 'https://exportseats.com/vp1ge6k02?key=c489b06da0cf1ceed18ed4d4ad470ee4' },
    { name: 'Bumper Offer 8', href: 'https://exportseats.com/yscmceke?key=325c6afc1d7d83b30524372aa1e584c4' },
    { name: 'Bumper Offer 9', href: 'https://exportseats.com/cg9hjv2957?key=aa535d9cefc044de0c3f116f9fc0df30' },
    { name: 'Bumper Offer 10', href: 'https://exportseats.com/yhpbyr1hc0?key=121375fe1b6d287983723ef859ac6d7d' },
    { name: 'Bumper Offer 11', href: 'https://exportseats.com/jmnqe1gc?key=53755058a15fd950718897e97e84b512' },
    { name: 'Bumper Offer 12', href: 'https://exportseats.com/ridvqpvr7?key=270c4065b81c3e649f001d289f315113' },
    { name: 'Bumper Offer 13', href: 'https://exportseats.com/qyy895we?key=cdd8d956b2f9b5f1260f3d939a32116c' },
    { name: 'Bumper Offer 14', href: 'https://exportseats.com/tzshk4sn?key=6497b840915a8293b880426b63b520d9' },
    { name: 'Bumper Offer 15', href: 'https://exportseats.com/rrch2di8?key=2ea9f6e97d4f2313dbd9d0ec759a10db' },
    { name: 'Bumper Offer 16', href: 'https://exportseats.com/gn0rtp68h?key=38b9ae24fed8c22d67b7cda26b9f9185' },
    { name: 'Bumper Offer 17', href: 'https://exportseats.com/r063ky9w?key=f9b0b6300cbf3d57324614a2d90f413f' },
    { name: 'Bumper Offer 18', href: 'https://exportseats.com/xs9sbkqc8?key=a44ee277986f2ccdc153fd06cd2285dd' },
    { name: 'Bumper Offer 19', href: 'https://exportseats.com/u73vga5j?key=d0d54abbdb12ed811cf25ed960bdf59f' },
    { name: 'Bumper Offer 20', href: 'https://exportseats.com/iq8f7uk8ij?key=0ecfa4f0c7dc637ddf44da1b78b2d903' },
    { name: 'Bumper Offer 21', href: 'https://exportseats.com/jxdwpjxc?key=8562e589a2f895a6a12e5363c982dc2d' },
    { name: 'Bumper Offer 22', href: 'https://exportseats.com/vkjz7dn73?key=7176105a20b0a64185eaae28824c5968' },
    { name: 'Bumper Offer 23', href: 'https://exportseats.com/qp903znizm?key=655122a1d4e9439c8542dcc0989b5baa' },
    { name: 'Bumper Offer 24', href: 'https://exportseats.com/hfugq62u?key=fed2d0b5fc3b21b5a5be8857f795d410' },
    { name: 'Bumper Offer 25', href: 'https://exportseats.com/u84i3t7wm?key=1336d3b6c2c7e7955dc2fcb79a6e2153' },
    { name: 'Bumper Offer 26', href: 'https://exportseats.com/buuq41vt5?key=32b03f1855563c3adc0beb3fcc2a7690' },
    { name: 'Bumper Offer 27', href: 'https://exportseats.com/kk4i62rfe6?key=75a0be631d8f31823386826601228548' },
    { name: 'Bumper Offer 28', href: 'https://exportseats.com/yp328dgin?key=f6fec4ba6327dc952736839f224b7aec' },
    { name: 'Bumper Offer 29', href: 'https://exportseats.com/yhyzuqqa?key=787f92844e2098bedeebc799636e4e91' },
    { name: 'Bumper Offer 30', href: 'https://exportseats.com/emxqiu94?key=baa83d37604740c29c944b9dbf02683b' },
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
        const offer9 = smartLinks.find(link => link.id === 'so9');

        if (offer1) window.open(offer1.href, '_blank');
        if (offer2) window.open(offer2.href, '_blank');
        if (offer3) window.open(offer3.href, '_blank');
        if (offer4) window.open(offer4.href, '_blank');
        if (offer5) window.open(offer5.href, '_blank');
        if (offer6) window.open(offer6.href, '_blank');
        if (offer7) window.open(offer7.href, '_blank');
        if (offer8) window.open(offer8.href, '_blank');
        if (offer9) window.open(offer9.href, '_blank');
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

    const handleBestOffersClick = () => {
        bestOffers.forEach(offer => {
            window.open(offer.href, '_blank');
        });
    };
    
    const handleBumperOfferClick = () => {
        bumperOffers.forEach(offer => {
            window.open(offer.href, '_blank');
        })
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Offers</CardTitle>
                    <CardDescription>Explore these exclusive links and offers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="special">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="special">Special Offers & Deals</TabsTrigger>
                            <TabsTrigger value="best">Best Offers</TabsTrigger>
                            <TabsTrigger value="bumper">Bumper Offer</TabsTrigger>
                        </TabsList>
                        <TabsContent value="special" className="pt-4">
                             <div className="space-y-3">
                                {smartLinks.map((link) => {
                                    if (link.id === 'so1') {
                                        return <SpecialOffer1Card key={link.id} />;
                                    }
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
                            </div>
                        </TabsContent>
                        <TabsContent value="best" className="pt-4">
                             <div className="space-y-3">
                                <Button onClick={handleBestOffersClick} className="w-full">
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    Open All Best Offers
                                </Button>
                                {bestOffers.map((link, index) => (
                                    <SmartLinkCard key={index} name={link.name} href={link.href} />
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="bumper" className="pt-4">
                            <div className="space-y-3">
                                <Button onClick={handleBumperOfferClick} className="w-full">
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    Open All Bumper Offers
                                </Button>
                                {bumperOffers.map((link, index) => (
                                    <SmartLinkCard key={index} name={link.name} href={link.href} />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
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
