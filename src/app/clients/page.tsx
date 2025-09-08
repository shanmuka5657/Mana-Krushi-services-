
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBookings, getCurrentUserName } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { User, Phone, Calendar } from 'lucide-react';
import { Suspense } from 'react';

type Client = {
    name: string;
    mobile: string;
    lastBookingDate: Date;
    totalBookings: number;
}

function ClientsPageContent() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const ownerName = getCurrentUserName();
        const allBookings = getBookings();
        
        // Filter bookings where the owner is the driver
        const ownerBookings = allBookings.filter(b => b.driverName === ownerName);

        const clientMap: { [mobile: string]: Client } = {};

        ownerBookings.forEach(booking => {
            if (!booking.mobile) return; // Skip if no mobile number

            if (!clientMap[booking.mobile]) {
                clientMap[booking.mobile] = {
                    name: booking.client,
                    mobile: booking.mobile,
                    lastBookingDate: new Date(booking.departureDate),
                    totalBookings: 0,
                };
            }
            clientMap[booking.mobile].totalBookings += 1;
            if (new Date(booking.departureDate) > clientMap[booking.mobile].lastBookingDate) {
                clientMap[booking.mobile].lastBookingDate = new Date(booking.departureDate);
            }
        });

        const clientList = Object.values(clientMap).sort((a, b) => b.lastBookingDate.getTime() - a.lastBookingDate.getTime());

        setClients(clientList);
        setIsLoaded(true);
    }, []);

    if (!isLoaded) {
        return <AppLayout><div>Loading clients...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>My Clients</CardTitle>
                    <CardDescription>A list of all passengers who have booked with you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead>Total Bookings</TableHead>
                                <TableHead>Last Booking</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.length > 0 ? clients.map(client => (
                                <TableRow key={client.mobile}>
                                    <TableCell className="font-medium flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {client.name}</TableCell>
                                    <TableCell><Phone className="h-4 w-4 mr-2 inline text-muted-foreground" />{client.mobile}</TableCell>
                                    <TableCell>{client.totalBookings}</TableCell>
                                    <TableCell><Calendar className="h-4 w-4 mr-2 inline text-muted-foreground" />{format(client.lastBookingDate, 'PPP')}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No clients found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}


export default function ClientsPage() {
    return (
        <Suspense>
            <ClientsPageContent />
        </Suspense>
    )
}
