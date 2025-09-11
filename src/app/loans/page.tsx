
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { ChevronRight } from 'lucide-react';

const loanProviders = [
    {
        name: "Poonawalla Fincorp Instant Loan",
        href: "https://clnk.in/w6hE",
        description: "Get instant personal loans with attractive interest rates."
    },
    {
        name: "Bajaj Finserv Personal Loan",
        href: "https://clnk.in/w6hf",
        description: "Get a Personal Loan up to ₹40 Lakh with instant approval."
    },
    {
        name: "RupeeRedee",
        href: "https://linksredirect.com/?cid=245979&source=linkkit&url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.rupeeredee.app",
        description: "Instant personal loans for your immediate needs."
    },
    {
        name: "Axis Bank DSA",
        href: "https://clnk.in/w6f1",
        description: "Partner with Axis bank for various financial products."
    }
];

function LoanProviderListItem({ name, href, description }: { name: string, href: string, description: string }) {
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

function LoansPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Apply for a Loan</CardTitle>
                    <CardDescription>Explore personal and business loan options from our trusted partners.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loanProviders.map(provider => (
                        <LoanProviderListItem key={provider.name} {...provider} />
                    ))}
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
