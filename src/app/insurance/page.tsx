
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { ChevronRight, Shield, User, FileText, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

const insuranceProviders = [
    {
        name: "Acko General Insurance",
        href: "https://www.acko.com/",
        description: "Digital-first insurer, ideal for embedded, per-trip coverage.",
        logoUrl: "https://i.ibb.co/3mSzzSGP/Screenshot-2025-09-14-12-37-47-041-com-whatsapp.jpg"
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

function SampleInsuranceCertificate() {
    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText />
                    Sample In-Trip Insurance
                </CardTitle>
                <CardDescription>This is an example of the coverage provided on a promoted ride.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg p-4 sm:p-6 space-y-4 bg-muted/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                             <h3 className="text-lg font-semibold text-primary">Your Ride is Insured</h3>
                             <p className="text-sm text-muted-foreground">Policy #TRIP-123456789</p>
                        </div>
                        <div className="w-24 h-12 relative flex-shrink-0">
                            <Image src="https://i.ibb.co/3mSzzSGP/Screenshot-2025-09-14-12-37-47-041-com-whatsapp.jpg" alt="Acko Logo" layout="fill" objectFit="contain" />
                        </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-semibold">Insured Passenger</p>
                            <p className="text-muted-foreground">Priya Sharma</p>
                        </div>
                         <div>
                            <p className="font-semibold">Covered Ride</p>
                            <p className="text-muted-foreground">Hyderabad to Vijayawada</p>
                            <p className="text-xs text-muted-foreground">Vehicle: AP 09 BE 5678</p>
                        </div>
                    </div>
                    <Separator />
                     <div>
                        <p className="font-semibold mb-2">Coverage Details</p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <div>
                                    <span className="font-medium">Personal Accident:</span>
                                    <span className="text-muted-foreground"> up to ₹5,00,000</span>
                                </div>
                            </li>
                             <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <div>
                                    <span className="font-medium">Emergency Medical:</span>
                                    <span className="text-muted-foreground"> up to ₹1,00,000</span>
                                </div>
                            </li>
                             <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <div>
                                    <span className="font-medium">Baggage Loss:</span>
                                    <span className="text-muted-foreground"> up to ₹10,000</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <p className="text-xs text-muted-foreground pt-4">This is a sample certificate for illustrative purposes only. Actual terms, conditions, and coverage amounts are subject to the policy issued by the insurance partner.</p>
                </div>
            </CardContent>
        </Card>
    );
}

function InsurancePageContent() {
    return (
        <AppLayout>
            <div className="space-y-8">
                <SampleInsuranceCertificate />
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield />
                            Potential Insurance Partners
                        </CardTitle>
                        <CardDescription>Explore potential insurance providers suitable for ride-sharing platforms.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {insuranceProviders.map(provider => (
                            <InsuranceProviderListItem key={provider.name} {...provider} />
                        ))}
                    </CardContent>
                </Card>
            </div>
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
