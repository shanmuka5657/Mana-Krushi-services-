
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const partners = [
    {
        name: "AU Small Finance Bank",
        profit: "Earn Profit",
        logoUrl: "https://i.ibb.co/9HnQ0BCP/Whats-App-Image-2025-09-11-at-13-24-36.jpg",
        href: "https://clnk.in/w59c"
    },
    {
        name: "BookMyShow",
        profit: "Earn Profit",
        logoUrl: "https://i.ibb.co/hCjQc0f/bookmyshow-logo.png",
        href: "https://clnk.in/w59G"
    },
    {
        name: "Flipkart",
        profit: "Upto 8% Profit",
        logoUrl: "https://i.ibb.co/wZSZ4WpG/Screenshot-2025-09-10-16-42-10-763-com-whatsapp.jpg",
        href: "https://clnk.in/w6fv"
    },
    {
        name: "Ajio",
        profit: "Upto 10% Profit",
        logoUrl: "https://i.ibb.co/MDpS82Nn/Screenshot-2025-09-10-16-42-56-634-com-whatsapp.jpg",
        href: "https://www.ajio.com"
    },
    {
        name: "Myntra",
        profit: "Upto 8% Profit",
        logoUrl: "https://i.ibb.co/PJ1jwbR/Screenshot-2025-09-10-16-43-27-664-com-whatsapp.jpg",
        href: "https://clnk.in/w6d7"
    },
    {
        name: "Amazon.in",
        profit: "Upto 12% Profit",
        logoUrl: "https://i.ibb.co/dGk5wzZ/amazon-in-logo.jpg",
        href: "https://www.amazon.in"
    },
    {
        name: "Dot and Key Store",
        profit: "Upto 15% Profit",
        logoUrl: "https://i.ibb.co/nMYr6d5C/Screenshot-2025-09-10-16-44-04-673-com-whatsapp.jpg",
        href: "https://www.dotandkey.com"
    },
    {
        name: "BuyKaro",
        profit: "Upto 18% Profit",
        logoUrl: "https://i.ibb.co/f30tsFj/Screenshot-2025-09-10-16-44-51-303-com-whatsapp.jpg",
        href: "https://www.buykaro.com"
    },
    {
        name: "Aceblend",
        profit: "Earn Profit",
        logoUrl: "https://i.ibb.co/b3wPVSF/Screenshot-2024-07-28-at-12-07-21-AM.png",
        href: "https://clnk.in/w594"
    },
    {
        name: "Creative AI",
        profit: "Earn Profit",
        logoUrl: "https://i.ibb.co/b3wPVSF/Screenshot-2024-07-28-at-12-07-21-AM.png",
        href: "https://clnk.in/w6d4"
    },
    {
        name: "Pepperstone",
        profit: "Earn Profit",
        logoUrl: "https://i.ibb.co/b3wPVSF/Screenshot-2024-07-28-at-12-07-21-AM.png",
        href: "https://clnk.in/w6fh"
    },
    {
        name: "IndusInd Saving Account",
        profit: "Earn Profit",
        logoUrl: "https://i.ibb.co/b3wPVSF/Screenshot-2024-07-28-at-12-07-21-AM.png",
        href: "https://clnk.in/w6hk"
    },
    {
        name: "Kotak 811 Savings Account",
        profit: "Earn Profit",
        logoUrl: "https://i.ibb.co/pvCJmNJw/Whats-App-Image-2025-09-11-at-14-08-10.jpg",
        href: "https://clnk.in/w6hB"
    }
];

function PartnerCard({ name, profit, logoUrl, href }: { name: string, profit: string, logoUrl: string, href: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full">
            <Card className="w-full transition-all hover:bg-muted/50 hover:shadow-sm">
                <CardContent className="p-3 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg border bg-background flex items-center justify-center overflow-hidden flex-shrink-0">
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
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const filteredPartners = useMemo(() => {
        if (!query) {
            return partners;
        }
        return partners.filter(partner => 
            partner.name.toLowerCase().includes(query.toLowerCase())
        );
    }, [query]);

    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Our Partners</CardTitle>
                        <CardDescription>
                            {query 
                                ? `Showing ${filteredPartners.length} results for "${query}"`
                                : "Explore exclusive offers from our partners."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {filteredPartners.length > 0 ? (
                            filteredPartners.map((partner, index) => (
                                <PartnerCard key={index} {...partner} />
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">No partners found matching your search.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
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
