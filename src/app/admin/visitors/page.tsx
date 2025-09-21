
"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getVisits } from '@/lib/storage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Visit } from '@/lib/types';
import { Eye, Loader2, Users, File, BarChart2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type PathStats = {
    path: string;
    visits: number;
    uniqueUsers: number;
}

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

    const pathStats: PathStats[] = useMemo(() => {
        const stats: Record<string, { visits: number, users: Set<string> }> = {};

        visits.forEach(visit => {
            if (!stats[visit.path]) {
                stats[visit.path] = { visits: 0, users: new Set() };
            }
            stats[visit.path].visits++;
            stats[visit.path].users.add(visit.userEmail);
        });

        return Object.entries(stats).map(([path, data]) => ({
            path,
            visits: data.visits,
            uniqueUsers: data.users.size,
        })).sort((a, b) => b.visits - a.visits);

    }, [visits]);

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
                    <CardTitle>Page Analytics</CardTitle>
                    <CardDescription>
                        A breakdown of which pages are being visited the most. This data can help identify where the most database reads are occurring.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Page Path</TableHead>
                                <TableHead className="text-right">Total Visits</TableHead>
                                <TableHead className="text-right">Unique Users</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pathStats.length > 0 ? pathStats.map(stat => (
                                <TableRow key={stat.path}>
                                    <TableCell className="font-mono flex items-center gap-2">
                                        <File className="h-4 w-4 text-muted-foreground" />
                                        {stat.path}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary" className="text-sm">
                                            <Eye className="mr-2 h-3.5 w-3.5" />
                                            {stat.visits.toLocaleString()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className="text-sm">
                                             <Users className="mr-2 h-3.5 w-3.5" />
                                            {stat.uniqueUsers.toLocaleString()}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
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
