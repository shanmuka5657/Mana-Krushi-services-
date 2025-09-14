
"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllProfiles } from '@/lib/storage';
import type { Profile } from '@/lib/types';
import { format } from 'date-fns';
import { User, Phone, Mail, Shield, Download, CheckCircle, ShieldAlert } from 'lucide-react';
import { Badge as UiBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/utils';

type FilterRole = 'all' | 'owner' | 'passenger';

function AdminUsersPage() {
    const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const initialRole = (searchParams.get('role') as FilterRole) || 'all';
    const [filter, setFilter] = useState<FilterRole>(initialRole);

    useEffect(() => {
        const fetchProfiles = async () => {
            const profiles = await getAllProfiles();
            setAllProfiles(profiles);
            setIsLoaded(true);
        };
        fetchProfiles();
    }, []);
    
    const handleFilterChange = (newFilter: FilterRole) => {
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        if (newFilter === 'all') {
            params.delete('role');
        } else {
            params.set('role', newFilter);
        }
        router.push(`/admin/users?${params.toString()}`);
    }

    const filteredProfiles = useMemo(() => {
        if (filter === 'all') return allProfiles;
        return allProfiles.filter(p => p.role === filter);
    }, [allProfiles, filter]);

    const handleExport = () => {
        const dataToExport = filteredProfiles.map(p => ({
            Name: p.name,
            Email: p.email,
            Mobile: p.mobile,
            'Mobile Verified': p.mobileVerified ? 'Yes' : 'No',
            Role: p.role,
            'Plan Expiry': p.planExpiryDate ? format(new Date(p.planExpiryDate), 'PPP') : 'N/A'
        }));
        exportToCsv(`${filter}-users.csv`, dataToExport);
    }

    const getPageInfo = () => {
        switch(filter) {
            case 'owner': return { title: "All Owners", description: "A list of all registered vehicle owners." };
            case 'passenger': return { title: "All Passengers", description: "A list of all registered passengers." };
            default: return { title: "All Users", description: "A list of all registered users in the system." };
        }
    }
    
    const { title, description } = getPageInfo();

    if (!isLoaded) {
        return <AppLayout><div>Loading users...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             <Button onClick={handleExport} variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                   </div>
                    <div className="flex items-center space-x-2 pt-4">
                        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => handleFilterChange('all')}>All</Button>
                        <Button variant={filter === 'owner' ? 'default' : 'outline'} onClick={() => handleFilterChange('owner')}>Owners</Button>
                        <Button variant={filter === 'passenger' ? 'default' : 'outline'} onClick={() => handleFilterChange('passenger')}>Passengers</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Plan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProfiles.length > 0 ? filteredProfiles.map(profile => (
                                <TableRow key={profile.email}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" /> {profile.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />{profile.email}
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{profile.mobile}</span>
                                                {profile.mobileVerified ? (
                                                    <UiBadge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                                        <CheckCircle className="h-3 w-3 mr-1" /> Verified
                                                    </UiBadge>
                                                ) : (
                                                    <UiBadge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                        <ShieldAlert className="h-3 w-3 mr-1" /> Unverified
                                                    </UiBadge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
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
                                    <TableCell colSpan={5} className="h-24 text-center">No users found for this filter.</TableCell>
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
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <AdminUsersPage />
        </Suspense>
    );
}
