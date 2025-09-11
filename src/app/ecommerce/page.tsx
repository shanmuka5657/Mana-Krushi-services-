
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

const partners = [
    {
        name: "HSBC Platinum Credit Card",
        profit: "Flat Rs 3000 Profit",
        logoUrl: "https://i.ibb.co/HL7bzmLQ/Screenshot-2025-09-10-16-10-48-382-com-whatsapp.jpg",
        href: "https://www.hsbc.co.in/credit-cards/products/platinum/"
    },
    {
        name: "Axis MyZone Credit Card Store",
        profit: "Flat Rs 2380 Profit",
        logoUrl: "https://i.ibb.co/Ld4mj8X1/Screenshot-2025-09-10-16-18-00-679-com-whatsapp.jpg",
        href: "https://www.axisbank.com/retail/cards/credit-card/my-zone-credit-card/"
    },
    {
        name: "Axis Flipkart Credit Card Store",
        profit: "Flat Rs 2380 Profit",
        logoUrl: "https://i.ibb.co/Ld4mj8X1/Screenshot.png",
        href: "https://www.flipkart.com/axis-bank-credit-card-store"
    },
    {
        name: "Axis Bank DSA",
        profit: "Earn Profit",
        logoUrl: "https://i.ibb.co/wK5G2P4/Screenshot-2025-09-10-16-18-00-679-com-whatsapp.jpg",
        href: "https://clnk.in/w6f1"
    },
    {
        name: "AU Small Finance Bank",
        profit: "Earn Profit",
        logoUrl: "https://i.ibb.co/yQWJ9f3/au-bank.jpg",
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
        name: "SBI Cashback Credit Card",
        profit: "Flat Rs 2500 Profit",
        logoUrl: "https://i.ibb.co/ZpQDy8yB/Screenshot-2025-09-10-16-45-25-696-com-whatsapp.jpg",
        href: "https://www.sbicard.com/en-in/personal/credit-cards/shopping/cashback-sbi-card"
    },
    {
        name: "Rio - UPI Rupay Credit Card",
        profit: "Earn Profit",
        logoUrl: "https://i.ibb.co/Yc5Yv7g/Screenshot-2024-07-28-at-12-07-21-AM.png",
        href: "https://clnk.in/w593"
    },
    {
        name: "Aceblend",
        profit: "Earn Profit",
        logoUrl: "https://i.ibb.co/b3wPVSF/Screenshot-2024-07-28-at-12-07-21-AM.png",
        href: "https://clnk.in/w594"
    },
    {
        name: "RupeeRedee",
        profit: "Earn Profit",
        logoUrl: "https://i.ibb.co/b3wPVSF/Screenshot-2024-07-28-at-12-07-21-AM.png",
        href: "https://linksredirect.com/?cid=245979&source=linkkit&url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.rupeeredee.app"
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
    }
];

function AxisBanner() {
    return (
        <a href="https://clnk.in/w6f1" target="_blank" rel="noopener noreferrer" className="block w-full group">
            <Card className="w-full overflow-hidden relative text-white aspect-[4/1] md:aspect-[5/1]">
                 <Image 
                    src="https://picsum.photos/seed/axis-banner/1200/240"
                    alt="Axis Bank Banner"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="bank offer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-800/80 via-purple-600/60 to-transparent p-4 md:p-6 flex flex-col justify-center">
                    <h3 className="text-lg md:text-2xl font-bold">Axis Bank Digital Saving Account</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-xs">Open a zero balance account online.</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-purple-900 hover:bg-gray-100 text-xs md:text-sm">
                        Apply Now <ShoppingCart className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </a>
    )
}


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
    
    useEffect(() => {
        // This function will try to run the Cuelinks script.
        const runCuelinks = () => {
            if (typeof (window as any).cuelinks?.js?.run === 'function') {
                (window as any).cuelinks.js.run();
                // If it runs successfully, we can stop checking.
                clearInterval(intervalId);
            }
        };

        // Run it once, just in case the script is already loaded.
        runCuelinks();

        // Also set up an interval to keep trying, in case the script loads later.
        // This is a robust way to handle scripts that might load asynchronously.
        const intervalId = setInterval(runCuelinks, 500); // Check every 500ms

        // Clean up the interval when the component is unmounted to prevent memory leaks.
        return () => clearInterval(intervalId);
    }, []);


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
                <AxisBanner />
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
