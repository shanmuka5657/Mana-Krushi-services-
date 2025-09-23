
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Suspense, useState } from 'react';
import { IndianRupee, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


type LoanPartner = {
    name: string;
    description: string;
    url: string;
};

const partners: LoanPartner[] = [
    {
        name: "Abhi Loans",
        description: "Get instant personal loans with a quick and easy application process. Click below to get started.",
        url: "https://clnk.in/w89P"
    },
    {
        name: "Nexa Loan",
        description: "Flexible personal loans for your every need. Explore competitive rates and simple repayment options.",
        url: "https://clnk.in/w9ah"
    }
];

function LoansPageContent() {
    const [selectedPartner, setSelectedPartner] = useState<LoanPartner | null>(null);

    const handleApplyClick = (partner: LoanPartner) => {
        setSelectedPartner(partner);
    };

    const handleContinue = () => {
        if (selectedPartner) {
            window.open(selectedPartner.url, '_blank', 'noopener,noreferrer');
        }
        setSelectedPartner(null);
    };

    return (
        <>
            <AppLayout>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><IndianRupee />Apply for a Loan</CardTitle>
                        <CardDescription>Explore personal loan options from our partners.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        {partners.map((partner) => (
                            <Card key={partner.name}>
                                <CardHeader>
                                    <CardTitle>{partner.name}</CardTitle>
                                    <CardDescription>{partner.description}</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Button onClick={() => handleApplyClick(partner)}>
                                        Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </AppLayout>

            <AlertDialog open={!!selectedPartner} onOpenChange={(open) => !open && setSelectedPartner(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-yellow-500" />
                            You are leaving our app
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to be redirected to an external website ({selectedPartner?.name}). We are not responsible for the content of external sites.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="text-sm p-2 bg-muted rounded-md break-all">
                        <span className="font-semibold">URL:</span> {selectedPartner?.url}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedPartner(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleContinue}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default function LoansPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <LoansPageContent />
        </Suspense>
    )
}
