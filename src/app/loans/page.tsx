
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Suspense } from 'react';
import { IndianRupee, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


function LoansPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><IndianRupee />Apply for a Loan</CardTitle>
                    <CardDescription>Explore personal loan options from our partners.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Abhi Loans</CardTitle>
                            <CardDescription>Get instant personal loans with a quick and easy application process. Click below to get started.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild>
                                <a href="https://clnk.in/w89P" target="_blank" rel="noopener noreferrer">
                                    Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Nexa Loan</CardTitle>
                            <CardDescription>Flexible personal loans for your every need. Explore competitive rates and simple repayment options.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild>
                                <a href="https://clnk.in/w9ah" target="_blank" rel="noopener noreferrer">
                                    Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>
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
