
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBookings, getCurrentUserName } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { DollarSign, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Suspense } from 'react';

function PaymentsPageContent() {
    const [payments, setPayments] = useState<Booking[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const ownerName = getCurrentUserName();
        const allBookings = getBookings();
        // Filter for completed and paid bookings for the current owner
        const ownerPayments = allBookings.filter(b => 
            b.driverName === ownerName && b.paymentStatus === 'Paid'
        ).sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());
        
        setPayments(ownerPayments);
        setIsLoaded(true);
    }, []);

    if (!isLoaded) {
        return <AppLayout><div>Loading payments...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>A record of all completed payments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Booking ID</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length > 0 ? payments.map(payment => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-mono">{payment.id}</TableCell>
                                    <TableCell className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{payment.client}</TableCell>
                                    <TableCell>{format(new Date(payment.departureDate), 'PPP')}</TableCell>
                                    <TableCell><DollarSign className="h-4 w-4 mr-2 inline text-muted-foreground" />{payment.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={payment.paymentMethod === 'Cash' ? 'secondary' : 'default'}>{payment.paymentMethod}</Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No payment history found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function PaymentsPage(){
    return(
        <Suspense>
            <PaymentsPageContent />
        </Suspense>
    )
}
