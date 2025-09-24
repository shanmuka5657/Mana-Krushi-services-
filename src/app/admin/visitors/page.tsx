

"use client";

import { useState, useEffect, Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getVisits } from '@/lib/storage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Visit } from '@/lib/types';
import { Eye, Loader2, User, Calendar, Route as RouteIcon, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

function AdminVisitorsPage() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchVisits = async () => {
            const allVisits = await getVisits(); // This will now be limited by the logic in storage/firebase
            setVisits(allVisits);
            setIsLoaded(true);
        };
        fetchVisits();
    }, []);


    if (!isLoaded) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity Log</CardTitle>
                    <CardDescription>
                        A list of the most recent page visits across the application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Page Path</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visits.length > 0 ? visits.map(visit => (
                                <TableRow key={visit.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            {visit.userName}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={visit.role === 'admin' ? 'default' : (visit.role === 'owner' ? 'secondary' : 'outline')}>
                                            {visit.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono flex items-center gap-2">
                                        <RouteIcon className="h-4 w-4 text-muted-foreground" />
                                        {visit.path}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {format(visit.timestamp, 'PPP pp')}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No visitor data recorded yet.
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
