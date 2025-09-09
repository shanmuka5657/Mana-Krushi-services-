
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Route, Book, IndianRupee, User, Calendar, Shield } from "lucide-react";
import { getRoutes, getBookings, getAllProfiles } from "@/lib/storage";
import type { Booking, Route as RouteType, Profile } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const StatCard = ({ title, value, icon: Icon, href }: { title: string, value: string | number, icon: React.ElementType, href: string }) => (
    <Link href={href}>
        <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    </Link>
);

const RecentBookingItem = ({ booking }: { booking: Booking }) => (
    <div className="flex items-center">
        <Avatar className="h-9 w-9">
             <AvatarImage src={`https://ui-avatars.com/api/?name=${booking.client.replace(' ', '+')}&background=random`} />
            <AvatarFallback>{booking.client.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{booking.client}</p>
            <p className="text-sm text-muted-foreground">{booking.destination}</p>
        </div>
        <div className="ml-auto font-medium">₹{booking.amount.toFixed(2)}</div>
    </div>
);

const NewUserItem = ({ profile }: { profile: Profile }) => (
     <div className="flex items-center gap-4">
        <Avatar className="hidden h-9 w-9 sm:flex">
             <AvatarImage src={`https://ui-avatars.com/api/?name=${profile.name.replace(' ', '+')}&background=random`} />
            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
        <div className="ml-auto text-right">
             <Badge variant={profile.role === 'owner' ? 'secondary' : 'outline'}>{profile.role}</Badge>
            {profile.planExpiryDate && (
                 <div className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                    <Shield className="h-3 w-3 text-green-500" />
                    <span>{format(new Date(profile.planExpiryDate), "dd MMM yyyy")}</span>
                </div>
            )}
        </div>
    </div>
);


function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoutes: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [newUsers, setNewUsers] = useState<Profile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      const [profiles, routes, bookings] = await Promise.all([
        getAllProfiles(),
        getRoutes(true),
        getBookings(true),
      ]);

      const bookingRevenue = bookings
        .filter(b => b.paymentStatus === 'Paid')
        .reduce((sum, b) => sum + (b.amount || 0), 0);
      
      // Calculate subscription revenue (₹50 per owner with a plan)
      const subscriptionRevenue = profiles.filter(p => p.role === 'owner' && p.planExpiryDate).length * 50;

      const totalRevenue = bookingRevenue + subscriptionRevenue;
      
      const sortedBookings = [...bookings].sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());
      setRecentBookings(sortedBookings.slice(0, 5));

      // Assuming profiles don't have a creation date, we'll just take the first few as "new"
      setNewUsers(profiles.slice(0, 5));


      setStats({
        totalUsers: profiles.length,
        totalRoutes: routes.length,
        totalBookings: bookings.length,
        totalRevenue: totalRevenue,
      });

      setIsLoaded(true);
    };
    fetchAdminData();
  }, []);

  if (!isLoaded) {
    return <AppLayout><div>Loading admin dashboard...</div></AppLayout>;
  }

  return (
    <AppLayout>
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} href="/admin/users" />
                <StatCard title="Total Routes" value={stats.totalRoutes} icon={Route} href="/admin/routes" />
                <StatCard title="Total Bookings" value={stats.totalBookings} icon={Book} href="/admin/bookings" />
                <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} icon={IndianRupee} href="/admin/payments" />
            </div>

             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>The 5 most recent bookings from across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentBookings.length > 0 ? recentBookings.map(b => <RecentBookingItem key={b.id} booking={b} />) : <p className="text-sm text-muted-foreground">No bookings yet.</p>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>New Users</CardTitle>
                        <CardDescription>The most recently registered users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {newUsers.length > 0 ? newUsers.map(p => <NewUserItem key={p.email} profile={p} />) : <p className="text-sm text-muted-foreground">No users yet.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    </AppLayout>
  );
}

export default function AdminDashboard() {
    return <AdminDashboardPage />;
}
