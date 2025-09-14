
"use client";

import { useState, useEffect } from "react";
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
import type { Booking, Route, Profile } from "@/lib/types";
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
import { User, Phone, Car, Calendar, Clock, MessageSquare, AlertCircle, MapPin, Milestone, Shield, Map, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getBookings, saveBookings, getRoutes, getAllProfiles } from "@/lib/storage";
import { useRouter } from "next/navigation";

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
  const [routes, setRoutes] = useState<Route[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [reportText, setReportText] = useState("");
  const { toast } = useToast();
  const [dialogAction, setDialogAction] = useState<'view' | 'report' | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
        setRoutes(await getRoutes(true));
        setAllProfiles(await getAllProfiles());
    }
    fetchData();
  }, []);
  
  const isRideComplete = (booking: Booking) => {
    const rideEndTime = new Date(booking.departureDate); // This should ideally be arrival time if available
    return rideEndTime < new Date();
  }

  const getProfileForUser = (email?: string): Profile | undefined => {
    if (!email) return undefined;
    return allProfiles.find(p => p.email === email);
  }
  
  const handleReportSubmit = async () => {
    if (!selectedBooking || reportText.trim().length < 10) {
      toast({
        title: "Report too short",
        description: "Please provide at least 10 characters in your report.",
        variant: "destructive",
      });
      return;
    }
    const updatedBookingData = { ...selectedBooking, report: reportText };

    // Remove undefined values before saving to Firestore
    const updatedBooking = Object.fromEntries(
      Object.entries(updatedBookingData).filter(([, value]) => value !== undefined)
    );
    
    const allBookings = await getBookings();
    const updatedBookings = allBookings.map((b: Booking) => b.id === updatedBooking.id ? (updatedBooking as Booking) : b);
    await saveBookings(updatedBookings);
    
    onUpdateBooking(updatedBooking as Booking);

    toast({
      title: "Report Submitted",
      description: "Thank you for your feedback. The owner has been notified.",
    });
    setReportText("");
    setDialogAction(null);
    setSelectedBooking(null);
  };
  
  const handleOpenDialog = (booking: Booking, action: 'view' | 'report') => {
      setSelectedBooking(booking);
      setDialogAction(action);
  }

  const getBookingStatus = (booking: Booking): Booking['status'] => {
    if (booking.status === 'Cancelled' || booking.status === 'Completed') {
        return booking.status;
    }
    if (isRideComplete(booking) && booking.status === 'Confirmed') {
        return 'Completed';
    }
    return booking.status;
  }
  
  const getDistanceForBooking = (booking: Booking) => {
      const bookingTime = format(new Date(booking.departureDate), 'HH:mm');
      const bookingDate = new Date(booking.departureDate);
      
      const relatedRoute = routes.find(route => {
          const routeDate = new Date(route.travelDate);
          const isSameDay = routeDate.getFullYear() === bookingDate.getFullYear() &&
                            routeDate.getMonth() === bookingDate.getMonth() &&
                            routeDate.getDate() === bookingDate.getDate();

          return route.departureTime === bookingTime && 
                 `${route.fromLocation} to ${route.toLocation}` === booking.destination && 
                 isSameDay;
      });
      return relatedRoute?.distance;
  }

  return (
    <Card className="shadow-sm mt-6">
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedBooking(null)}>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[600px]">
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
                  bookings.map((booking) => {
                    const status = getBookingStatus(booking);
                    return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium font-mono text-xs">{booking.bookingCode || booking.id}</TableCell>
                      <TableCell className="whitespace-nowrap">{booking.destination}</TableCell>
                      <TableCell className="whitespace-nowrap">{format(new Date(booking.departureDate), "dd MMM, HH:mm")}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        ₹{(booking.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClass(status)}
                        >
                        {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(booking, 'view')}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <Button variant="secondary" size="sm" onClick={() => router.push(`/track/${booking.id}`)}>
                              <Map className="mr-2 h-4 w-4" /> Track
                          </Button>
                          {status === 'Completed' && !booking.report && (
                              <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm" onClick={() => handleOpenDialog(booking, 'report')}>
                                      <AlertCircle className="h-4 w-4 mr-2" /> Report
                                  </Button>
                              </DialogTrigger>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )})
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      You have no bookings.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {selectedBooking && (
            <DialogContent className="max-h-[90vh] flex flex-col">
                {dialogAction === 'view' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Details for booking {selectedBooking.bookingCode || selectedBooking.id}</DialogTitle>
                            <DialogDescription>
                            Passenger, driver and vehicle information for your trip.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4 overflow-y-auto pr-2">
                           <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Passenger</p>
                                        <p className="font-medium">{selectedBooking.client}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Mobile</p>
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <p className="font-medium">{selectedBooking.mobile}</p>
                                            {getProfileForUser(selectedBooking.clientEmail)?.mobileVerified && (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                           </div>
                           <hr/>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Destination</p>
                                        <p className="font-medium">{selectedBooking.destination}</p>
                                    </div>
                                </div>
                                 <div className="flex items-start gap-3">
                                    <Milestone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Distance</p>
                                        <p className="font-medium">{selectedBooking.distance ? `${selectedBooking.distance.toFixed(0)} km` : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Driver</p>
                                        <p className="font-medium">{selectedBooking.driverName || 'N/A'}</p>
                                    </div>
                                </div>
                                 <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Driver Mobile</p>
                                         <div className="flex items-center gap-1 flex-wrap">
                                            <p className="font-medium">{selectedBooking.driverMobile || 'N/A'}</p>
                                            {getProfileForUser(selectedBooking.driverEmail)?.mobileVerified && (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                 <div className="flex items-start gap-3">
                                    <Car className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Vehicle Type</p>
                                        <p className="font-medium">{selectedBooking.vehicleType || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Vehicle Number</p>
                                        <p className="font-medium">{selectedBooking.vehicleNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                             <hr />
                             <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Departure</p>
                                        <p className="font-medium">{format(new Date(selectedBooking.departureDate), "dd MMM yyyy")}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Time</p>
                                        <p className="font-medium">{format(new Date(selectedBooking.departureDate), "HH:mm")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                         <DialogFooter className="mt-auto pt-4 border-t">
                            <DialogClose asChild>
                                <Button variant="outline" className="w-full">Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                         <DialogHeader>
                            <DialogTitle>Report an issue for booking {selectedBooking.bookingCode || selectedBooking.id}</DialogTitle>
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
                                <Button variant="ghost" onClick={() => setReportText('')}>Cancel</Button>                            </DialogClose>
                            <Button onClick={handleReportSubmit}>Submit Report</Button>
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
