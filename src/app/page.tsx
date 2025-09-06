
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import StatCards from "@/components/dashboard/stat-cards";
import RecentBookings from "@/components/dashboard/recent-bookings";
import BookingForm from "@/components/dashboard/booking-form";
import { useState } from "react";
import type { Booking } from "@/lib/types";
import { format } from "date-fns";
import type { BookingFormValues } from "@/components/dashboard/booking-form";

const initialBookings: Booking[] = [
  {
    id: "#BK001",
    client: "John Smith",
    destination: "Paris, France",
    departureDate: new Date("2023-08-15"),
    returnDate: new Date("2023-08-22"),
    amount: 2450,
    status: "Confirmed",
    mobile: "1234567890",
    travelers: "2",
  },
  {
    id: "#BK002",
    client: "Emma Wilson",
    destination: "Bali, Indonesia",
    departureDate: new Date("2023-08-22"),
    returnDate: new Date("2023-08-29"),
    amount: 1890,
    status: "Pending",
    mobile: "1234567890",
    travelers: "1",
  },
  {
    id: "#BK003",
    client: "Michael Brown",
    destination: "Tokyo, Japan",
    departureDate: new Date("2023-09-05"),
    returnDate: new Date("2023-09-12"),
    amount: 3250,
    status: "Confirmed",
    mobile: "1234567890",
    travelers: "3",
  },
  {
    id: "#BK004",
    client: "Sophia Davis",
    destination: "Rome, Italy",
    departureDate: new Date("2023-09-12"),
    returnDate: new Date("2023-09-19"),
    amount: 2150,
    status: "Cancelled",
    mobile: "1234567890",
    travelers: "2",
  },
  {
    id: "#BK005",
    client: "Robert Johnson",
    destination: "New York, USA",
    departureDate: new Date("2023-09-18"),
    returnDate: new Date("2023-09-25"),
    amount: 1750,
    status: "Confirmed",
    mobile: "1234567890",
    travelers: "4",
  },
];

export default function Home() {
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
