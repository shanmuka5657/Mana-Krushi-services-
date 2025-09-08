
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { User, Phone, Car, Calendar, Clock, MessageSquare, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveBookings } from "@/lib/storage";

const getStatusBadgeClass = (status: Booking["status"]) => {
  switch (status) {
    case "Confirmed":
      return "bg-chart-2/20 text-chart-2 hover:bg-chart-2/30 border-chart-2/20";
    case "Pending":
      return "bg-accent/20 text-accent hover:bg-accent/30 border-accent/20";
    case "Completed":
      return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-500/20";
    case "Cancelled":
      return "bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/20";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

interface RecentBookingsProps {
  bookings: Booking[];
  onUpdateBooking: (updatedBooking: Booking) => void;
}

const RecentBookings = ({ bookings, onUpdateBooking }: RecentBookingsProps) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reportText, setReportText] = useState("");
  const { toast } = useToast();
  
  const isRideComplete = (booking: Booking) => {
      return new Date(booking.departureDate) < new Date();
  }
  
  const handleReportSubmit = () => {
    if (!selectedBooking || reportText.trim().length < 10) {
      toast({
        title: "Report too short",
        description: "Please provide at least 10 characters in your report.",
        variant: "destructive",
      });
      return;
    }
    const updatedBooking = { ...selectedBooking, report: reportText };
    onUpdateBooking(updatedBooking);
    
    // Also persist this change
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = allBookings.map((b: Booking) => b.id === updatedBooking.id ? updatedBooking : b);
    saveBookings(updatedBookings);

    toast({
      title: "Report Submitted",
      description: "Thank you for your feedback. The owner has been notified.",
    });
    setReportText("");
  };

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
                    <TableCell>{format(new Date(booking.departureDate), "dd MMM yyyy, HH:mm")}</TableCell>
                    <TableCell className="text-right">
                      ₹{(booking.amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClass(
                          isRideComplete(booking) && booking.status === "Confirmed"
                            ? "Completed"
                            : booking.status
                        )}
                      >
                        {isRideComplete(booking) && booking.status === "Confirmed"
                          ? "Completed"
                          : booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex gap-2">
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        {isRideComplete(booking) && !booking.report && (
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="sm" onClick={() => setSelectedBooking(booking)}>
                                    <AlertCircle className="h-4 w-4 mr-2" /> Report
                                </Button>
                            </DialogTrigger>
                        )}
                      </div>
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
                {/* Conditional rendering based on whether it's a 'view' or 'report' action */}
                {!isRideComplete(selectedBooking) || (isRideComplete(selectedBooking) && !reportText && !selectedBooking.report) ? (
                    <>
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
                                        {format(new Date(selectedBooking.departureDate), "dd MMM yyyy")}
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
                                        {format(new Date(selectedBooking.departureDate), "HH:mm")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                         <DialogHeader>
                            <DialogTitle>Report an issue for booking {selectedBooking.id}</DialogTitle>
                            <DialogDescription>
                                Your feedback is anonymous and helps us improve our service.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea 
                                placeholder="Describe the issue... (e.g., driver behavior, vehicle condition, late arrival)"
                                value={reportText}
                                onChange={(e) => setReportText(e.target.value)}
                                rows={5}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button onClick={handleReportSubmit}>Submit Report</Button>
                            </DialogClose>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RecentBookings;
