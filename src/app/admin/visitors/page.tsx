
"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getVisits } from '@/lib/storage';
import type { Visit } from '@/lib/types';
import { format, formatDistance } from 'date-fns';
import { User, Mail, Shield, Clock, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type UserSession = {
    sessionId: string;
    userName: string;
    userEmail: string;
    role: string;
    startTime: Date;
    endTime: Date;
    pageCount: number;
    duration: string;
}

function AdminVisitorsPage() {
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchAndProcessVisits = async () => {
            const allVisits = await getVisits();

            const sessionsMap: Record<string, Visit[]> = {};
            allVisits.forEach(visit => {
                if (!sessionsMap[visit.sessionId]) {
                    sessionsMap[visit.sessionId] = [];
                }
                sessionsMap[visit.sessionId].push(visit);
            });

            const processedSessions: UserSession[] = Object.values(sessionsMap).map(visitsInSession => {
                visitsInSession.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                const firstVisit = visitsInSession[0];
                const lastVisit = visitsInSession[visitsInSession.length - 1];
                
                const duration = formatDistance(new Date(lastVisit.timestamp), new Date(firstVisit.timestamp), { includeSeconds: true });

                return {
                    sessionId: firstVisit.sessionId,
                    userName: firstVisit.userName,
                    userEmail: firstVisit.userEmail,
                    role: firstVisit.role,
                    startTime: new Date(firstVisit.timestamp),
                    endTime: new Date(lastVisit.timestamp),
                    pageCount: visitsInSession.length,
                    duration: duration,
                };
            }).sort((a,b) => b.startTime.getTime() - a.startTime.getTime());


            setSessions(processedSessions);
            setIsLoaded(true);
        };
        fetchAndProcessVisits();
    }, []);

    if (!isLoaded) {
        return <AppLayout><div>Loading visitor data...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>User Sessions</CardTitle>
                    <CardDescription>A list of recent sessions from registered users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Session Start</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.length > 0 ? sessions.map(session => (
                                <TableRow key={session.sessionId}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="font-medium flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" /> {session.userName}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Mail className="h-4 w-4" /> {session.userEmail}
                                            </div>
                                            <Badge variant={session.role === 'owner' ? 'secondary' : (session.role === 'admin' ? 'default' : 'outline')} className="mt-1 w-fit">
                                                <Shield className="h-3 w-3 mr-1" />
                                                {session.role}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            {format(new Date(session.startTime), 'PPP pp')}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Timer className="h-4 w-4 text-muted-foreground" />
                                           {session.duration} ({session.pageCount} pages)
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                        <Button variant="outline" size="sm" disabled>View Details</Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No session data found.
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
