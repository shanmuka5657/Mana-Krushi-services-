
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Route } from "@/lib/types";
import { format } from "date-fns";

interface MyRoutesProps {
  routes: Route[];
}

const MyRoutes = ({ routes }: MyRoutesProps) => {
  return (
    <Card className="shadow-sm mt-6">
      <CardHeader>
        <CardTitle>My Routes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 bg-secondary hover:bg-secondary">
              <TableHead className="rounded-l-lg">From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead className="rounded-r-lg">Vehicle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length > 0 ? (
              routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.fromLocation}</TableCell>
                  <TableCell>{route.toLocation}</TableCell>
                  <TableCell>{format(route.travelDate, "dd MMM yyyy")}</TableCell>
                  <TableCell>{route.departureTime}</TableCell>
                  <TableCell>{route.arrivalTime}</TableCell>
                  <TableCell>{route.availableSeats}</TableCell>
                  <TableCell>{route.vehicleType}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No routes added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MyRoutes;
