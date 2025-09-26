

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking, Route, Profile } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { User, Phone, Car, Calendar, Clock, AlertCircle, CheckCircle, Trash2, Loader2, MapPin, Milestone, Shield, MessagesSquare } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getBookings, saveBookings, getRoutes, getAllProfiles, getCurrentUser, getProfile, onBookingsUpdate } from "@/lib/storage";
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
  initialBookings: Booking[];
  mode: "upcoming" | "past" | "all";
  onUpdateBooking?: (updatedBooking: Booking) => Promise<void>;
}

const RecentBookings = ({ initialBookings, mode, onUpdateBooking: onUpdateBookingProp }: RecentBookingsProps) => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<{route: Route | undefined, clientProfile: Profile | undefined, driverProfile: Profile | undefined}>({ route: undefined, clientProfile: undefined, driverProfile: undefined });
  const [reportText, setReportText] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const { toast } = useToast();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();


  useEffect(() => {
    const fetchUserRole = async () => {
        const profile = await getProfile();
        setUserRole(profile?.role || 'passenger');
    }
    fetchUserRole();
    const currentUserEmail = getCurrentUser();

    const handleRealtimeUpdates = (allUserBookings: Booking[]) => {
        let filteredBookings;
        const today = startOfDay(new Date());
        
        if (mode === 'upcoming') {
            filteredBookings = allUserBookings.filter(b => new Date(b.departureDate) >= today && b.status !== 'Cancelled');
        } else if (mode === 'past') {
            filteredBookings = allUserBookings.filter(b => new Date(b.departureDate) < today || b.status === 'Cancelled');
        } else { // 'all'
            filteredBookings = allUserBookings;
        }
        
        // Sort by earliest date first for 'upcoming', latest first for others
        if (mode === 'upcoming') {
            filteredBookings.sort((a, b) => new Date(a.departureDate).getTime() - new Date(a.departureDate).getTime());
        } else {
             filteredBookings.sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());
        }
        
        setBookings(filteredBookings);
        setIsLoading(false);
    }
    
    // Set initial state and then subscribe for updates
    handleRealtimeUpdates(initialBookings);

    // Only subscribe if we are not on the admin page (which passes all bookings)
    if (mode !== 'all') {
        const profileRole = userRole as 'passenger' | 'owner' | 'admin' | null;
        const searchParams = (!profileRole || profileRole === 'admin') ? undefined : { userEmail: currentUserEmail as string, role: profileRole };
        const unsubscribe = onBookingsUpdate(handleRealtimeUpdates, searchParams);
        return () => unsubscribe();
    } else {
        // For admin page, we just use the initial list
         setIsLoading(false);
    }

  }, [initialBookings, mode, userRole]);



  const handleUpdateBooking = async (updatedBooking: Booking) => {
    // If a prop is passed, use it (for admin page to update all bookings)
    if (onUpdateBookingProp) {
        await onUpdateBookingProp(updatedBooking);
        return;
    }

    // Otherwise, perform the standard update
    const allBookings = await getBookings(true);
    const updatedAllBookings = allBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
    await saveBookings(updatedAllBookings);
  };


  const isRideComplete = (booking: Booking) => {
    const rideEndTime = new Date(booking.departureDate); // This should ideally be arrival time if available
    return rideEndTime < new Date();
  }
  
  const handleViewClick = async (booking: Booking) => {
    setSelectedBooking(booking);
    
    // Fetch details on demand
    const bookingDateStr = format(new Date(booking.departureDate), 'yyyy-MM-dd');
    const [routeData, clientProfile, driverProfile] = await Promise.all([
        getRoutes(true, { date: bookingDateStr, from: booking.destination.split(' to ')[0], to: booking.destination.split(' to ')[1] }),
        getProfile(booking.clientEmail),
        getProfile(booking.driverEmail),
    ]);
    
    // Find the specific route that matches the booking's departure time
    const bookingTime = format(new Date(booking.departureDate), 'HH:mm');
    const route = routeData.find(r => r.departureTime === bookingTime);

    setSelectedBookingDetails({ route, clientProfile, driverProfile });
    setIsViewOpen(true);
  };
  
  const handleReportSubmit = async () => {
    if (!selectedBooking || !reportText.trim()) {
      toast({
        title: "Report cannot be empty",
        description: "Please provide some feedback in your report.",
        variant: "destructive",
      });
      return;
    }
    const updatedBookingData = { ...selectedBooking, report: reportText };

    const updatedBooking = Object.fromEntries(
      Object.entries(updatedBookingData).filter(([, value]) => value !== undefined)
    );
    
    await handleUpdateBooking(updatedBooking as Booking);

    toast({
      title: "Report Submitted",
      description: "Thank you for your feedback. The owner has been notified.",
    });
    setReportText("");
    setIsReportOpen(false);
    setSelectedBooking(null);
  };
  
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    const updatedBooking: Booking = { ...selectedBooking, status: "Cancelled", cancellationReason: cancellationReason || "No reason provided" };
    
    await handleUpdateBooking(updatedBooking);

    toast({
      title: "Booking Cancelled",
      description: `Your booking ${selectedBooking.bookingCode || selectedBooking.id} has been cancelled.`,
      variant: 'destructive'
    });
    
    toast({
        title: "Driver Notified (Simulated)",
        description: `The driver has been notified of your cancellation.`
    })
    
    setIsCancelOpen(false);
    setSelectedBooking(null);
    setCancellationReason("");
  };


  const getBookingStatus = (booking: Booking): Booking['status'] => {
    if (booking.status === 'Cancelled' || booking.status === 'Completed') {
        return booking.status;
    }
    if (isRideComplete(booking) && booking.status === 'Confirmed') {
        return 'Completed';
    }
    return booking.status;
  }
  
  const maskPhoneNumber = (phone: string | undefined): string => {
      if (!userRole || userRole !== 'admin') {
          if (!phone || phone.length < 10) return 'N/A';
          return `${phone.substring(0, 5)}xxxxx`;
      }
      return phone || 'N/A';
  };
  
  const getPageInfo = () => {
    switch(mode) {
        case 'upcoming': return { title: 'Upcoming Bookings', description: 'Your upcoming confirmed rides.', defaultMessage: "You have no upcoming bookings." };
        case 'past': return { title: 'Booking History', description: 'A record of your past and cancelled rides.', defaultMessage: 'You have no past bookings.' };
        case 'all': return { title: 'All Bookings', description: 'A list of all bookings made by all passengers.', defaultMessage: 'No bookings found.' };
        default: return { title: 'My Bookings', description: 'Your bookings', defaultMessage: 'No bookings found.' };
    }
  };
  
  const { title, description, defaultMessage } = getPageInfo();
  
  const shouldShowHeader = mode !== 'all';


  return (
    <>
    <Card className="shadow-sm mt-6">
      {shouldShowHeader && (
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
      )}
      <CardContent>
          <div className="w-full overflow-x-auto">
            {isLoading ? (
                 <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
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
                        const canCancel = !isRideComplete(booking) && (status === 'Confirmed' || status === 'Pending');

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
                                <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewClick(booking)}
                                >
                                View
                                </Button>
                            {status === 'Completed' && !booking.report && (
                                    <Button variant="destructive" size="sm" onClick={() => { setSelectedBooking(booking); setIsReportOpen(true); }}>
                                        <AlertCircle className="h-4 w-4 mr-2" /> Report
                                    </Button>
                            )}
                            {canCancel && (
                                    <Button variant="destructive" size="sm" onClick={() => { setSelectedBooking(booking); setIsCancelOpen(true); }}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Cancel
                                    </Button>
                            )}
                            </div>
                        </TableCell>
                        </TableRow>
                    )})
                    ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                        {defaultMessage}
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            )}
          </div>
      </CardContent>
    </Card>

    {/* View Dialog */}
    <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
       {selectedBooking && (
            <DialogContent className="max-h-[90vh] flex flex-col">
                 <DialogHeader>
                    <DialogTitle>Details for booking {selectedBooking.bookingCode || selectedBooking.id}</DialogTitle>
                    <DialogDescription>
                    Passenger, driver and vehicle information for your trip.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 overflow-y-auto pr-2">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    {selectedBookingDetails.clientProfile?.mobileVerified && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                            <CheckCircle className="h-3 w-3 mr-1" /> Verified
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                   </div>
                   <hr/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <p className="font-medium">{selectedBookingDetails.route?.distance ? `${selectedBookingDetails.route.distance.toFixed(0)} km` : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                     <hr />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                            <div>
                                <p className="text-sm text-muted-foreground">Driver</p>
                                <p className="font-medium">{selectedBooking.driverName || 'N/A'}</p>
                            </div>
                        </div>
                         <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Driver Mobile</p>
                                    <p className="font-medium">{maskPhoneNumber(selectedBooking.driverMobile)}</p>
                                </div>
                            </div>
                            {selectedBooking.driverMobile && userRole === 'admin' && (
                                <a href={`tel:${selectedBooking.driverMobile}`}>
                                    <Button variant="outline">
                                        <Phone className="mr-2 h-4 w-4" />
                                        Call
                                    </Button>
                                </a>
                            )}
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
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                 <DialogFooter className="mt-auto pt-4 border-t flex-col sm:flex-row sm:justify-between w-full">
                     <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                     {userRole !== 'admin' && !isRideComplete(selectedBooking) && (
                        <Button onClick={() => router.push(`/chat/${selectedBooking.routeId}`)}>
                            <MessagesSquare className="mr-2 h-4 w-4" />
                            Go to Chat
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
       )}
    </Dialog>

    {/* Report Dialog */}
     <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        {selectedBooking && (
             <DialogContent>
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
                        <Button variant="ghost" onClick={() => setReportText('')}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleReportSubmit}>Submit Report</Button>
                </DialogFooter>
            </DialogContent>
        )}
     </Dialog>

    {/* Cancel Dialog */}
    <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        {selectedBooking && (
             <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure you want to cancel?</DialogTitle>
                    <DialogDescription>
                       This action cannot be undone. Please let us know why you're cancelling.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea 
                        placeholder="Optional: What is the reason for cancellation?"
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        rows={3}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" onClick={() => setCancellationReason('')}>Back</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleCancelBooking}>Yes, Cancel Booking</Button>
                </DialogFooter>
            </DialogContent>
        )}
     </Dialog>

    </>
  );
};

export default RecentBookings;


