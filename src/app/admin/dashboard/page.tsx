
"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Route, Book, DollarSign } from "lucide-react";
import { getRoutes, getBookings, getAllProfiles } from "@/lib/storage";
import type { Booking, Route as RouteType, Profile } from "@/lib/types";

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalPassengers: 0,
    totalRoutes: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      const [profiles, routes, bookings] = await Promise.all([
        getAllProfiles(),
        getRoutes(true),
        getBookings(true),
      ]);

      const totalRevenue = bookings
        .filter(b => b.paymentStatus === 'Paid')
        .reduce((sum, b) => sum + (b.amount || 0), 0);
      
      const ownerCount = profiles.filter(p => p.role === 'owner').length;
      const passengerCount = profiles.filter(p => p.role === 'passenger').length;

      setStats({
        totalUsers: profiles.length,
        totalOwners: ownerCount,
        totalPassengers: passengerCount,
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard title="Total Owners" value={stats.totalOwners} icon={Users} />
        <StatCard title="Total Passengers" value={stats.totalPassengers} icon={Users} />
        <StatCard title="Total Routes" value={stats.totalRoutes} icon={Route} />
        <StatCard title="Total Bookings" value={stats.totalBookings} icon={Book} />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} />
      </div>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Welcome, Admin!</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Use the navigation on the left to manage users, view all routes, bookings, and payments.</p>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function AdminDashboard() {
    return <AdminDashboardPage />;
}
