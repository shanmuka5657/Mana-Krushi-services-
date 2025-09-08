
"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentBookings from "@/components/dashboard/recent-bookings";
import BookingForm from "@/components/dashboard/booking-form";
import type { Booking, Route } from "@/lib/types";
import type { BookingFormValues } from "@/components/dashboard/booking-form";
import type { OwnerFormValues } from "@/components/dashboard/owner-dashboard";
import OwnerDashboard from "@/components/dashboard/owner-dashboard";
import PassengerDashboard from "@/components/dashboard/passenger-dashboard";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import MyRoutes from "@/components/dashboard/my-routes";
import { getBookings, saveBookings, getRoutes, saveRoutes } from "@/lib/storage";
import ProfilePage from "./profile-page";

function DashboardPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "passenger"; 
  const defaultTab = role === 'owner' ? 'add-route' : 'find-ride';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client
    setBookings(getBookings());
    setRoutes(getRoutes());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveBookings(bookings);
    }
  }, [bookings, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveRoutes(routes);
    }
  }, [routes, isLoaded]);


  const addBooking = (newBookingData: Booking) => {
    setBookings((prevBookings) => [newBookingData, ...prevBookings]);
  };
  
  const addRoute = (newRouteData: OwnerFormValues) => {
    const newRoute: Route = {
      id: `ROUTE-${(routes.length + 1).toString().padStart(3, '0')}`,
      ...newRouteData
    };
    setRoutes((prevRoutes) => [newRoute, ...prevRoutes]);
  };
  
  const handleTabSwitch = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
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
             <OwnerDashboard onRouteAdded={addRoute} onSwitchTab={handleTabSwitch} />
          </TabsContent>
          <TabsContent value="my-routes">
            <MyRoutes routes={routes} />
          </TabsContent>
          <TabsContent value="profile">
            <ProfilePage />
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
            <RecentBookings bookings={bookings} />
          </TabsContent>
           <TabsContent value="profile">
            <ProfilePage />
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}


export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPage />
    </Suspense>
  )
}
