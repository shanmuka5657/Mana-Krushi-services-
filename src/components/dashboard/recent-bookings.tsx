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

const bookings: Booking[] = [
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

const RecentBookings = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
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
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>{booking.client}</TableCell>
                <TableCell>{booking.destination}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell className="text-right">
                  ${booking.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeClass(booking.status)}>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentBookings;
