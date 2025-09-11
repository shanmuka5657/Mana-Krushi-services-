
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { IndianRupee } from 'lucide-react';

function LoanProviderCard({ name, description, href, imageUrl, imageHint, cta, bgColor }: { name: string, description: string, href: string, imageUrl: string, imageHint: string, cta: string, bgColor: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full group">
            <Card className={`w-full overflow-hidden relative text-white ${bgColor}`}>
                 <Image 
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-20"
                    data-ai-hint={imageHint}
                />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg md:text-2xl font-bold">{name}</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-md">{description}</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-gray-900 hover:bg-gray-100 text-xs md:text-sm">
                        {cta}
                    </Button>
                </div>
            </Card>
        </a>
    )
}


function LoansPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Apply for a Loan</CardTitle>
                    <CardDescription>Explore personal and business loan options from our trusted partners.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <LoanProviderCard 
                        name="Poonawalla Fincorp Instant Loan"
                        description="Get instant personal loans with attractive interest rates."
                        href="https://clnk.in/w6hE"
                        imageUrl="https://picsum.photos/seed/poonawalla-loan/1200/240"
                        imageHint="finance loan"
                        cta="Apply Now"
                        bgColor="bg-green-900"
                    />
                     <LoanProviderCard 
                        name="Bajaj Finserv Personal Loan"
                        description="Get a Personal Loan up to ₹40 Lakh with instant approval."
                        href="https://clnk.in/w6hf"
                        imageUrl="https://picsum.photos/seed/bajaj-loan/1200/240"
                        imageHint="finance loan"
                        cta="Apply Now"
                        bgColor="bg-blue-900"
                    />
                    <LoanProviderCard 
                        name="RupeeRedee"
                        description="Instant personal loans for your immediate needs."
                        href="https://linksredirect.com/?cid=245979&source=linkkit&url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.rupeeredee.app"
                        imageUrl="https://picsum.photos/seed/rupeeredee-loan/1200/240"
                        imageHint="mobile app finance"
                        cta="Get App"
                        bgColor="bg-red-900"
                    />
                    <LoanProviderCard 
                        name="Axis Bank DSA"
                        description="Partner with Axis bank for various financial products."
                        href="https://clnk.in/w6f1"
                        imageUrl="https://picsum.photos/seed/axis-dsa/1200/240"
                        imageHint="bank offer"
                        cta="Learn More"
                        bgColor="bg-purple-900"
                    />
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function LoansPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <LoansPageContent />
        </Suspense>
    )
}
