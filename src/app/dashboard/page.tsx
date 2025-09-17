
"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentBookings from "@/components/dashboard/recent-bookings";
import type { Booking, Route } from "@/lib/types";
import type { OwnerFormValues } from "@/components/dashboard/owner-dashboard";
import OwnerDashboard from "@/components/dashboard/owner-dashboard";
import PassengerDashboard from "@/components/dashboard/passenger-dashboard";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import { getBookings, saveBookings, getRoutes, addRoute, getCurrentUserName, getCurrentUser } from "@/lib/storage";
import MyRoutes from "@/components/dashboard/my-routes";
import ProfileForm from "@/components/dashboard/profile-form";

function DashboardPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "passenger"; 
  const defaultTab = role === 'owner' ? 'add-route' : 'find-ride';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [bookingsFromStorage, allRoutes] = await Promise.all([getBookings(), getRoutes()]);
      
      setAllBookings(bookingsFromStorage);
      const currentUserName = getCurrentUserName();
      const currentUserEmail = getCurrentUser();

      if (role === 'passenger') {
        const filteredBookings = currentUserEmail ? bookingsFromStorage.filter(b => b.clientEmail === currentUserEmail) : [];
        setUserBookings(filteredBookings);
      } else {
        const ownerName = getCurrentUserName();
        const ownerRoutes = ownerName ? allRoutes.filter(r => r.ownerName === ownerName) : [];
        setRoutes(ownerRoutes);
        const ownerBookings = ownerName ? bookingsFromStorage.filter(b => b.driverName === ownerName) : [];
        setUserBookings(ownerBookings);
      }

      setIsLoaded(true);
    };
    fetchData();
  }, [role]);

  const handleAddRoute = async (newRouteData: OwnerFormValues & { pickupPoints?: string[], dropOffPoints?: string[] }) => {
    const ownerName = getCurrentUserName();
    if (!ownerName) {
        console.error("Owner name not found, cannot add route.");
        return;
    }
    
    const routeWithOwner = {
        ...newRouteData,
        ownerName: ownerName,
    };

    const newRoute = await addRoute(routeWithOwner);
    setRoutes((prevRoutes) => [newRoute, ...prevRoutes]);
  };
  
  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
  };
  
  const handleUpdateBooking = async (updatedBooking: Booking) => {
    const updatedAllBookings = allBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
    await saveBookings(updatedAllBookings);
    setAllBookings(updatedAllBookings);
    const currentUserEmail = getCurrentUser();
    if (role === 'passenger') {
      setUserBookings(currentUserEmail ? updatedAllBookings.filter(b => b.clientEmail === currentUserEmail) : []);
    } else {
      const ownerName = getCurrentUserName();
      const ownerBookings = ownerName ? updatedAllBookings.filter(b => b.driverName === ownerName) : [];
      setUserBookings(ownerBookings);
    }
  };


  if (!isLoaded) {
    return <AppLayout><div>Loading...</div></AppLayout>;
  }

  return (
    <AppLayout>
      {role === 'owner' ? (
        <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={handleTabSwitch} className="w-full">
          <TabsList>
            <TabsTrigger value="add-route">Add Route</TabsTrigger>
            <TabsTrigger value="my-routes">My Routes</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="add-route">
            <OwnerDashboard onRouteAdded={handleAddRoute} onSwitchTab={handleTabSwitch} />
          </TabsContent>
          <TabsContent value="my-routes">
            <MyRoutes routes={routes} />
          </TabsContent>
          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={handleTabSwitch} className="w-full">
          <TabsList>
            <TabsTrigger value="find-ride">Find a Ride</TabsTrigger>
            <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="find-ride">
            <PassengerDashboard onSwitchTab={handleTabSwitch} />
          </TabsContent>
          <TabsContent value="my-bookings">
            <RecentBookings bookings={userBookings} onUpdateBooking={handleUpdateBooking} />
          </TabsContent>
          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}


export default function Dashboard() {
  return (
    <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
      <DashboardPage />
    </Suspense>
  )
}
