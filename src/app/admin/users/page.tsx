
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllProfiles } from '@/lib/storage';
import type { Profile } from '@/lib/types';
import { format } from 'date-fns';
import { User, Phone, Mail, Shield, Badge } from 'lucide-react';
import { Badge as UiBadge } from '@/components/ui/badge';

function AdminUsersPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchProfiles = async () => {
            const allProfiles = await getAllProfiles();
            setProfiles(allProfiles);
            setIsLoaded(true);
        };
        fetchProfiles();
    }, []);

    if (!isLoaded) {
        return <AppLayout><div>Loading users...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all registered users in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Plan Expiry</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profiles.length > 0 ? profiles.map(profile => (
                                <TableRow key={profile.email}>
                                    <TableCell className="font-medium flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {profile.name}</TableCell>
                                    <TableCell><Mail className="h-4 w-4 mr-2 inline text-muted-foreground" />{profile.email}</TableCell>
                                    <TableCell><Phone className="h-4 w-4 mr-2 inline text-muted-foreground" />{profile.mobile}</TableCell>
                                    <TableCell>
                                        <UiBadge variant={profile.role === 'owner' ? 'secondary' : 'outline'}>
                                            {profile.role}
                                        </UiBadge>
                                    </TableCell>
                                    <TableCell>
                                        {profile.planExpiryDate ? (
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-green-500" />
                                                <span>{format(new Date(profile.planExpiryDate), 'PPP')}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No users found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function UsersPage() {
    return <AdminUsersPage />;
}
