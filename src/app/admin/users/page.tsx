
"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllProfiles, getVisits } from '@/lib/storage';
import type { Profile, Visit } from '@/lib/types';
import { format } from 'date-fns';
import { User, Phone, Mail, Shield, Download, CheckCircle, ShieldAlert, Gift, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge as UiBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/utils';

type FilterRole = 'all' | 'owner' | 'passenger';
type ProfileWithActivity = Profile & { activity: number };

const USERS_PER_PAGE = 20;

function AdminUsersPage() {
    const [allProfiles, setAllProfiles] = useState<ProfileWithActivity[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const initialRole = (searchParams.get('role') as FilterRole) || 'all';
    const [filter, setFilter] = useState<FilterRole>(initialRole);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchProfilesAndActivity = async () => {
            const [profiles, visits] = await Promise.all([
                getAllProfiles(),
                getVisits()
            ]);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Create a map to store activity counts
            const activityMap = new Map<string, Set<string>>();

            visits.forEach(visit => {
                if (new Date(visit.timestamp) >= today) {
                    if (!activityMap.has(visit.userEmail)) {
                        activityMap.set(visit.userEmail, new Set());
                    }
                    activityMap.get(visit.userEmail)!.add(visit.path);
                }
            });

            const profilesWithActivity = profiles.map(p => ({
                ...p,
                activity: activityMap.get(p.email)?.size || 0,
            }));
            
            setAllProfiles(profilesWithActivity);
            setIsLoaded(true);
        };
        fetchProfilesAndActivity();
    }, []);
    
    const handleFilterChange = (newFilter: FilterRole) => {
        setFilter(newFilter);
        setCurrentPage(1); // Reset to first page on filter change
        const params = new URLSearchParams(window.location.search);
        if (newFilter === 'all') {
            params.delete('role');
        } else {
            params.set('role', newFilter);
        }
        router.push(`/admin/users?${params.toString()}`);
    }

    const { paginatedProfiles, totalPages } = useMemo(() => {
        let sortedProfiles: ProfileWithActivity[];
        if (filter === 'all') {
            sortedProfiles = [...allProfiles];
        } else {
            sortedProfiles = allProfiles.filter(p => p.role === filter);
        }
        // Sort by activity, descending
        const profilesToPaginate = sortedProfiles.sort((a,b) => b.activity - a.activity);
        
        const total = Math.ceil(profilesToPaginate.length / USERS_PER_PAGE);

        const start = (currentPage - 1) * USERS_PER_PAGE;
        const end = start + USERS_PER_PAGE;
        const paginated = profilesToPaginate.slice(start, end);

        return { paginatedProfiles: paginated, totalPages: total };
    }, [allProfiles, filter, currentPage]);

    const handleExport = () => {
        // Export all filtered profiles, not just the paginated ones
        let profilesToExport: ProfileWithActivity[];
        if (filter === 'all') {
            profilesToExport = [...allProfiles];
        } else {
            profilesToExport = allProfiles.filter(p => p.role === filter);
        }
        
        const dataToExport = profilesToExport.map(p => ({
            Name: p.name,
            Email: p.email,
            Mobile: p.mobile,
            'Mobile Verified': p.mobileVerified ? 'Yes' : 'No',
            Role: p.role,
            'Todays Activity': p.activity,
            'Plan Expiry': p.planExpiryDate ? format(new Date(p.planExpiryDate), 'PPP') : 'N/A',
            'Referral Code': p.referralCode,
            'Referred By': p.referredBy,
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
                                <TableHead>Referrals</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Today's Activity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedProfiles.length > 0 ? paginatedProfiles.map(profile => (
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
                                        <div className="flex flex-col gap-1">
                                            {profile.referralCode && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Gift className="h-3 w-3 text-muted-foreground" />
                                                    <span className="font-mono">{profile.referralCode}</span>
                                                </div>
                                            )}
                                            {profile.referredBy && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    <span className="font-mono">by {profile.referredBy}</span>
                                                </div>
                                            )}
                                        </div>
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
                                     <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-muted-foreground" />
                                            <span>{profile.activity} visits</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">No users found for this filter.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                             <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
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

    