
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllProfiles } from '@/lib/storage';
import type { Profile } from '@/lib/types';
import { format } from 'date-fns';
import { User, Phone, Mail, Shield, Download } from 'lucide-react';
import { Badge as UiBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/utils';

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

    const handleExport = () => {
        const dataToExport = profiles.map(p => ({
            Name: p.name,
            Email: p.email,
            Mobile: p.mobile,
            Role: p.role,
            'Plan Expiry': p.planExpiryDate ? format(new Date(p.planExpiryDate), 'PPP') : 'N/A'
        }));
        exportToCsv('users.csv', dataToExport);
    }

    if (!isLoaded) {
        return <AppLayout><div>Loading users...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>A list of all registered users in the system.</CardDescription>
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
