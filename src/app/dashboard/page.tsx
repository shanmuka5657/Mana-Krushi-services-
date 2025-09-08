
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

function DashboardPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "passenger"; 
  
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


  const addBooking = (newBookingData: BookingFormValues) => {
    const newBooking: Booking = {
      id: `#BK${(bookings.length + 1).toString().padStart(3, '0')}`,
      client: newBookingData.clientName,
      destination: newBookingData.destination,
      departureDate: newBookingData.departureDate,
      returnDate: newBookingData.returnDate,
      amount: newBookingData.budget,
      mobile: newBookingData.mobile,
      travelers: newBookingData.travelers,
      status: "Pending",
    };
    setBookings((prevBookings) => [newBooking, ...prevBookings]);
  };
  
  const addRoute = (newRouteData: OwnerFormValues) => {
    const newRoute: Route = {
      id: `ROUTE-${(routes.length + 1).toString().padStart(3, '0')}`,
      ...newRouteData
    };
    setRoutes((prevRoutes) => [newRoute, ...prevRoutes]);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <AppLayout>
      {role === 'owner' ? (
         <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Add Route</TabsTrigger>
            <TabsTrigger value="routes">My Routes</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
             <OwnerDashboard onRouteAdded={addRoute} />
          </TabsContent>
          <TabsContent value="routes">
            <MyRoutes routes={routes} />
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="new-booking">Book a Ride</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <PassengerDashboard routes={routes} />
          </TabsContent>
          <TabsContent value="bookings">
            <RecentBookings bookings={bookings} />
          </TabsContent>
          <TabsContent value="new-booking">
            <BookingForm onBookingCreated={addBooking} />
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
