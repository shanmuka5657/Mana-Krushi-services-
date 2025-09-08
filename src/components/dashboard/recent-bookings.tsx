
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Phone, Car, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

const getStatusBadgeClass = (status: Booking["status"]) => {
  switch (status) {
    case "Confirmed":
      return "bg-chart-2/20 text-chart-2 hover:bg-chart-2/30 border-chart-2/20";
    case "Pending":
      return "bg-accent/20 text-accent hover:bg-accent/30 border-accent/20";
    case "Cancelled":
      return "bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/20";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

interface RecentBookingsProps {
  bookings: Booking[];
}

const RecentBookings = ({ bookings }: RecentBookingsProps) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  return (
    <Card className="shadow-sm mt-6">
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <Table>
            <TableHeader>
              <TableRow className="border-b-0 bg-secondary hover:bg-secondary">
                <TableHead className="rounded-l-lg">Booking ID</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="rounded-r-lg">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>{booking.destination}</TableCell>
                    <TableCell>{format(booking.departureDate, "dd MMM yyyy, HH:mm")}</TableCell>
                    <TableCell className="text-right">
                      ₹{(booking.amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClass(booking.status)}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          View
                        </Button>
                      </DialogTrigger>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    You have no bookings.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {selectedBooking && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Details for booking {selectedBooking.id}</DialogTitle>
                <DialogDescription>
                  Driver and vehicle information for your trip.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Driver Name
                    </span>
                    <span className="font-medium">
                      {selectedBooking.driverName || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Driver Mobile
                    </span>
                    <span className="font-medium">
                      {selectedBooking.driverMobile || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Vehicle Type
                    </span>
                    <span className="font-medium">
                      {selectedBooking.vehicleType || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">
                            Departure
                            </span>
                            <span className="font-medium">
                            {format(selectedBooking.departureDate, "dd MMM yyyy")}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">
                            Time
                            </span>
                            <span className="font-medium">
                            {format(selectedBooking.departureDate, "HH:mm")}
                            </span>
                        </div>
                    </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RecentBookings;
