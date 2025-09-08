
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentBookings from "@/components/dashboard/recent-bookings";
import BookingForm from "@/components/dashboard/booking-form";
import type { Booking } from "@/lib/types";
import type { BookingFormValues } from "@/components/dashboard/booking-form";
import OwnerDashboard from "@/components/dashboard/owner-dashboard";
import PassengerDashboard from "@/components/dashboard/passenger-dashboard";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';

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


function DashboardPage() {
  const searchParams = useSearchParams();
  // Default to 'passenger' if no role is specified
  const role = searchParams.get("role") || "passenger"; 
  
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

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
  
  return (
    <AppLayout>
      {role === 'owner' ? (
         <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="routes">My Routes</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
             <OwnerDashboard />
          </TabsContent>
          <TabsContent value="routes">
            <p>A list of routes added by the owner will be displayed here.</p>
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
            <PassengerDashboard />
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
