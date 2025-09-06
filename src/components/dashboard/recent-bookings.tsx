
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
import { User, Phone, Users } from "lucide-react";

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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <Table>
            <TableHeader>
              <TableRow className="border-b-0 bg-secondary hover:bg-secondary">
                <TableHead className="rounded-l-lg">Booking ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Date</TableHead>
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
                    <TableCell>{booking.client}</TableCell>
                    <TableCell>{booking.destination}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell className="text-right">
                      ${booking.amount.toLocaleString()}
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
                  <TableCell colSpan={7} className="h-24 text-center">
                    No recent bookings.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {selectedBooking && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Booking Details for {selectedBooking.id}</DialogTitle>
                <DialogDescription>
                  Client and travel information for this booking.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Client Name
                    </span>
                    <span className="font-medium">
                      {selectedBooking.client}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Mobile Number
                    </span>
                    <span className="font-medium">
                      {selectedBooking.mobile}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Travelers
                    </span>
                    <span className="font-medium">
                      {selectedBooking.travelers}
                    </span>
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
