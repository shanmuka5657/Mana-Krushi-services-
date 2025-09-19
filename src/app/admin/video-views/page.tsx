
"use client";

import { useState, useEffect, Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getVideoEvents } from '@/lib/storage';
import type { VideoEvent } from '@/lib/types';
import { format } from 'date-fns';
import { User, Mail, Youtube, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

function AdminVideoViewsPage() {
    const [events, setEvents] = useState<VideoEvent[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            const allEvents = await getVideoEvents();
            setEvents(allEvents);
            setIsLoaded(true);
        };
        fetchEvents();
    }, []);

    if (!isLoaded) {
        return <AppLayout><div>Loading video view data...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Video Unmute Events</CardTitle>
                    <CardDescription>A list of users who have unmuted the background video.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Video Watched</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.length > 0 ? events.map(event => (
                                <TableRow key={event.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="font-medium flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" /> {event.userName}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Mail className="h-4 w-4" /> {event.userEmail}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={event.role === 'owner' ? 'secondary' : (event.role === 'admin' ? 'default' : 'outline')}>
                                            {event.role}
                                        </Badge>
                                    </TableCell>
                                     <TableCell>
                                        <Link href={event.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline text-blue-600">
                                           <Youtube className="h-4 w-4" /> Link
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {format(new Date(event.timestamp), 'PPP p')}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No video unmute events found.
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


export default function VideoViewsPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <AdminVideoViewsPage />
        </Suspense>
    );
}
