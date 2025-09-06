
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import StatCards from "@/components/dashboard/stat-cards";
import RecentBookings from "@/components/dashboard/recent-bookings";
import BookingForm from "@/components/dashboard/booking-form";
import { useState } from "react";
import type { Booking } from "@/lib/types";
import { format } from "date-fns";

const initialBookings: Booking[] = [
  {
    id: "#BK001",
    client: "John Smith",
    destination: "Paris, France",
    date: "15 Aug 2023",
    amount: 2450,
    status: "Confirmed",
  },
  {
    id: "#BK002",
    client: "Emma Wilson",
    destination: "Bali, Indonesia",
    date: "22 Aug 2023",
    amount: 1890,
    status: "Pending",
  },
  {
    id: "#BK003",
    client: "Michael Brown",
    destination: "Tokyo, Japan",
    date: "05 Sep 2023",
    amount: 3250,
    status: "Confirmed",
  },
  {
    id: "#BK004",
    client: "Sophia Davis",
    destination: "Rome, Italy",
    date: "12 Sep 2023",
    amount: 2150,
    status: "Cancelled",
  },
  {
    id: "#BK005",
    client: "Robert Johnson",
    destination: "New York, USA",
    date: "18 Sep 2023",
    amount: 1750,
    status: "Confirmed",
  },
];

export default function Home() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const addBooking = (newBookingData: Omit<Booking, 'id' | 'status' | 'date'> & { departureDate: Date }) => {
    const newBooking: Booking = {
      id: `#BK${(bookings.length + 1).toString().padStart(3, '0')}`,
      client: newBookingData.clientName,
      destination: newBookingData.destination,
      date: format(newBookingData.departureDate, "dd MMM yyyy"),
      amount: newBookingData.budget,
      status: "Pending",
    };
    setBookings((prevBookings) => [newBooking, ...prevBookings]);
  };
  
  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold tracking-tight md:hidden">
          Dashboard
        </h2>
        <StatCards />
        <RecentBookings bookings={bookings} />
        <BookingForm onBookingCreated={addBooking} />
      </div>
    </AppLayout>
  );
}
