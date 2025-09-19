
"use client";

import { useState, useEffect, Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getVisits } from '@/lib/storage';
import type { Visit } from '@/lib/types';
import { format } from 'date-fns';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function AdminVisitorsPage() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchVisits = async () => {
            const allVisits = await getVisits();
            setVisits(allVisits);
            setIsLoaded(true);
        };
        fetchVisits();
    }, []);

    if (!isLoaded) {
        return <AppLayout><div>Loading visitor data...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Logged-in Visitors</CardTitle>
                    <CardDescription>A list of recent visits from registered users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Visited Page</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visits.length > 0 ? visits.map(visit => (
                                <TableRow key={visit.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="font-medium flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" /> {visit.userName}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Mail className="h-4 w-4" /> {visit.userEmail}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={visit.role === 'owner' ? 'secondary' : (visit.role === 'admin' ? 'default' : 'outline')}>
                                            {visit.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono">{visit.path}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {format(new Date(visit.timestamp), 'PPP pp')}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No visitor data found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}


export default function VisitorsPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <AdminVisitorsPage />
        </Suspense>
    );
}
