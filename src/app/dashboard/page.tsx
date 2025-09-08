
"use client";

import { useState } from "react";
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

const initialBookings: Booking[] = [
  {
    id: "#BK001",
    client: "John Smith",
    destination: "Paris, France",
    departureDate: new Date("2023-08-15T09:00:00"),
    returnDate: new Date("2023-08-22T17:00:00"),
    amount: 2450,
    status: "Confirmed",
    mobile: "1234567890",
    travelers: "2",
  },
  {
    id: "#BK002",
    client: "Emma Wilson",
    destination: "Bali, Indonesia",
    departureDate: new Date("2023-08-22T10:00:00"),
    returnDate: new Date("2023-08-29T18:00:00"),
    amount: 1890,
    status: "Pending",
    mobile: "1234567890",
    travelers: "1",
  },
];

const initialRoutes: Route[] = [
    { 
        id: "1", 
        ownerName: 'Alice', 
        fromLocation: 'New York', 
        toLocation: 'Boston', 
        travelDate: new Date("2024-08-15T00:00:00"),
        departureTime: '08:00', 
        arrivalTime: '12:00', 
        availableSeats: 3, 
        vehicleType: 'Sedan',
        driverName: "Alice",
        driverMobile: "1234567890" 
    },
    { 
        id: "2", 
        ownerName: 'Bob', 
        fromLocation: 'San Francisco', 
        toLocation: 'Los Angeles', 
        travelDate: new Date("2024-08-16T00:00:00"),
        departureTime: '10:00', 
        arrivalTime: '16:00', 
        availableSeats: 2, 
        vehicleType: 'SUV',
        driverName: "Bob",
        driverMobile: "1234567890" 
    },
    { 
        id: "3", 
        ownerName: 'Charlie', 
        fromLocation: 'New York', 
        toLocation: 'Boston', 
        travelDate: new Date("2024-08-15T00:00:00"),
        departureTime: '14:00', 
        arrivalTime: '18:00', 
        availableSeats: 4, 
        vehicleType: 'Minivan',
        driverName: "Charlie",
        driverMobile: "1234567890" 
    },
];


function DashboardPage() {
  const searchParams = useSearchParams();
  // Default to 'passenger' if no role is specified
  const role = searchParams.get("role") || "passenger"; 
  
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);

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
