"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

const partners = [
    {
        name: "HSBC Platinum Credit Card",
        profit: "Flat Rs 3000 Profit",
        logoUrl: "https://i.ibb.co/HL7bzmLQ/Screenshot-2025-09-10-16-10-48-382-com-whatsapp.jpg",
        href: "https://bitli.in/cbX2s28"
    },
    {
        name: "Axis MyZone Credit Card Store",
        profit: "Flat Rs 2380 Profit",
        logoUrl: "https://i.ibb.co/Ld4mj8X1/Screenshot-2025-09-10-16-18-00-679-com-whatsapp.jpg",
        href: "https://bitli.in/46cvNbg"
    },
    {
        name: "Axis Flipkart Credit Card Store",
        profit: "Flat Rs 2380 Profit",
        logoUrl: "https://i.ibb.co/Ld4mj8X1/Screenshot-2025-09-10-16-18-00-679-com-whatsapp.jpg",
        href: "https://bitli.in/jFcR7mp"
    },
    {
        name: "Flipkart store 2",
        profit: "Upto 8% Profit",
        logoUrl: "https://i.ibb.co/wZSZ4WpG/Screenshot-2025-09-10-16-42-10-763-com-whatsapp.jpg",
        href: "https://fktr.in/Fy8fl6D"
    },
    {
        name: "Ajio New Store",
        profit: "Upto 10% Profit",
        logoUrl: "https://i.ibb.co/tCgLpP3/ajio-removebg-preview.png",
        href: "https://ajiio.in/DB82Cf0"
    },
    {
        name: "Myntra New",
        profit: "Upto 8% Profit",
        logoUrl: "https://i.ibb.co/tKgN3xK/myntra-removebg-preview.png",
        href: "https://myntr.it/33Qke2S"
    },
    {
        name: "Dot and Key Store",
        profit: "Upto 15% Profit",
        logoUrl: "https://i.ibb.co/9vWn4M9/dot-removebg-preview.png",
        href: "https://bitli.in/PF1Thjk"
    },
    {
        name: "BuyKaro",
        profit: "Upto 18% Profit",
        logoUrl: "https://i.ibb.co/pP23VpY/buy-removebg-preview.png",
        href: "https://bitli.in/HZ3TC24"
    },
    {
        name: "SBI Cashback Credit Card",
        profit: "Flat Rs 2500 Profit",
        logoUrl: "https://i.ibb.co/k2x6s6S/sbi-removebg-preview.png",
        href: "https://bitli.in/3Kcj3ST"
    }
];

function PartnerCard({ name, profit, logoUrl, href }: { name: string, profit: string, logoUrl: string, href: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full">
            <Card className="w-full transition-all hover:bg-muted/50 hover:shadow-sm">
                <CardContent className="p-3 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border bg-background flex items-center justify-center overflow-hidden flex-shrink-0">
                         <Image src={logoUrl} alt={`${name} logo`} width={60} height={60} className="object-contain" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold text-foreground">{name}</p>
                        <p className="text-sm font-bold text-green-600">{profit}</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground" />
                </CardContent>
            </Card>
        </a>
    )
}

function EcommercePageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Our Partners</CardTitle>
                    <CardDescription>Explore exclusive offers from our partners.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {partners.map((partner, index) => (
                        <PartnerCard key={index} {...partner} />
                    ))}
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
