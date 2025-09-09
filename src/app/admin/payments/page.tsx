
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBookings } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { DollarSign, User, Car, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/utils';

function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Booking[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchPayments = async () => {
            const allBookings = await getBookings(true);
            const allPayments = allBookings.filter(b => 
                b.paymentStatus === 'Paid'
            ).sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());
            
            setPayments(allPayments);
            setIsLoaded(true);
        }
        fetchPayments();
    }, []);

    const handleExport = () => {
        const dataToExport = payments.map(p => ({
            'Booking ID': p.id,
            'Client': p.client,
            'Owner': p.driverName,
            'Date': format(new Date(p.departureDate), 'PPP'),
            'Amount': p.amount.toFixed(2),
            'Method': p.paymentMethod,
        }));
        exportToCsv('payments-history.csv', dataToExport);
    }

    if (!isLoaded) {
        return <AppLayout><div>Loading payments...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Payments</CardTitle>
                        <CardDescription>A record of all completed payments from all users.</CardDescription>
                    </div>
                     <Button onClick={handleExport} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Booking ID</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Owner</TableHead>
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
                                    <TableCell><Car className="h-4 w-4 mr-2 inline text-muted-foreground" />{payment.driverName}</TableCell>
                                    <TableCell>{format(new Date(payment.departureDate), 'PPP')}</TableCell>
                                    <TableCell><DollarSign className="h-4 w-4 mr-2 inline text-muted-foreground" />{payment.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={payment.paymentMethod === 'Cash' ? 'secondary' : 'default'}>{payment.paymentMethod}</Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">No payment history found.</TableCell>
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
            <AdminPaymentsPage />
        </Suspense>
    )
}
