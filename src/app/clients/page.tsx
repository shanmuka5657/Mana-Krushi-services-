
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBookings, getCurrentUserName, getAllProfiles } from '@/lib/storage';
import type { Booking, Profile } from '@/lib/types';
import { format } from 'date-fns';
import { User, Phone, Calendar, Download, CheckCircle } from 'lucide-react';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Passenger = {
    name: string;
    mobile: string;
    email?: string;
    lastBookingDate: Date;
    totalBookings: number;
    isVerified?: boolean;
}

function PassengersPageContent() {
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchPassengers = async () => {
            const ownerName = getCurrentUserName();
            const [allBookings, allProfiles] = await Promise.all([
                getBookings(),
                getAllProfiles()
            ]);
            
            // Filter bookings where the owner is the driver
            const ownerBookings = allBookings.filter(b => b.driverName === ownerName);

            const passengerMap: { [mobile: string]: Passenger } = {};

            ownerBookings.forEach(booking => {
                if (!booking.mobile) return; // Skip if no mobile number

                if (!passengerMap[booking.mobile]) {
                    const profile = allProfiles.find(p => p.email === booking.clientEmail);
                    passengerMap[booking.mobile] = {
                        name: booking.client,
                        mobile: booking.mobile,
                        email: booking.clientEmail,
                        lastBookingDate: new Date(booking.departureDate),
                        totalBookings: 0,
                        isVerified: profile?.mobileVerified
                    };
                }
                passengerMap[booking.mobile].totalBookings += 1;
                if (new Date(booking.departureDate) > passengerMap[booking.mobile].lastBookingDate) {
                    passengerMap[booking.mobile].lastBookingDate = new Date(booking.departureDate);
                }
            });

            const passengerList = Object.values(passengerMap).sort((a, b) => b.lastBookingDate.getTime() - a.lastBookingDate.getTime());

            setPassengers(passengerList);
            setIsLoaded(true);
        };
        fetchPassengers();
    }, []);

    const handleExport = () => {
        const dataToExport = passengers.map(p => ({
            'Name': p.name,
            'Mobile': p.mobile,
            'Verified': p.isVerified ? 'Yes' : 'No',
            'Total Bookings': p.totalBookings,
            'Last Booking': format(p.lastBookingDate, 'PPP'),
        }));
        exportToCsv('my-passengers.csv', dataToExport);
    }

    if (!isLoaded) {
        return <AppLayout><div>Loading passengers...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>My Passengers</CardTitle>
                        <CardDescription>A list of all passengers who have booked with you.</CardDescription>
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
                                <TableHead>Name</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead>Total Bookings</TableHead>
                                <TableHead>Last Booking</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {passengers.length > 0 ? passengers.map(passenger => (
                                <TableRow key={passenger.mobile}>
                                    <TableCell className="font-medium flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {passenger.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 mr-2 inline text-muted-foreground" />
                                            {passenger.mobile}
                                            {passenger.isVerified && (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{passenger.totalBookings}</TableCell>
                                    <TableCell><Calendar className="h-4 w-4 mr-2 inline text-muted-foreground" />{format(passenger.lastBookingDate, 'PPP')}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No passengers found.</TableCell>

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
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <PassengersPageContent />
        </Suspense>
    )
}
