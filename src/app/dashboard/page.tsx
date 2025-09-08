
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
import { getBookings, saveBookings, getRoutes, addRoute, getCurrentUserName } from "@/lib/storage";
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

      if (role === 'passenger') {
        const filteredBookings = bookingsFromStorage.filter(b => b.client === currentUserName);
        setUserBookings(filteredBookings);
        setRoutes(allRoutes);
      } else {
        const ownerName = getCurrentUserName();
        const ownerRoutes = allRoutes.filter(r => r.ownerName === ownerName);
        setRoutes(ownerRoutes);
        setUserBookings(bookingsFromStorage); // Owner sees all bookings for now, can be refined.
      }

      setIsLoaded(true);
    };
    fetchData();
  }, [role]);

  const handleAddRoute = async (newRouteData: OwnerFormValues) => {
    const newRoute = await addRoute(newRouteData);
    setRoutes((prevRoutes) => [newRoute, ...prevRoutes]);
  };
  
  const handleTabSwitch = (tabValue: string) => {
    setActiveTab(tabValue);
  };
  
  const handleUpdateBooking = async (updatedBooking: Booking) => {
    const updatedAllBookings = allBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
    await saveBookings(updatedAllBookings);
    setAllBookings(updatedAllBookings);
    if (role === 'passenger') {
      const currentUserName = getCurrentUserName();
      setUserBookings(updatedAllBookings.filter(b => b.client === currentUserName));
    } else {
      setUserBookings(updatedAllBookings);
    }
  };


  if (!isLoaded) {
    return <AppLayout><div>Loading...</div></AppLayout>;
  }

  return (
    <AppLayout>
      {role === 'owner' ? (
         <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={handleTabSwitch}>
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
        <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={handleTabSwitch}>
          <TabsList>
            <TabsTrigger value="find-ride">Find a Ride</TabsTrigger>
            <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="find-ride">
            <PassengerDashboard routes={routes} onSwitchTab={handleTabSwitch} />
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
