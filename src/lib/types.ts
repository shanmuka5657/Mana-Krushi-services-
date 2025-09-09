
import { z } from 'zod';

export type Booking = {
  id: string;
  client: string;
  clientEmail?: string;
  destination: string;
  departureDate: Date;
  returnDate: Date;
  amount: number;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed";
  travelers: string;
  mobile: string;
  driverName?: string;
  driverMobile?: string;
  vehicleType?: string;
  paymentMethod?: "Cash" | "UPI" | "Pending";
  paymentStatus?: "Paid" | "Unpaid";
  report?: string;
  distance?: number;
};

export type Route = {
  id: string;
  ownerName: string;
  driverName: string;
  driverMobile: string;
  fromLocation: string;
  toLocation: string;
  distance?: number;
  pickupPoints?: string[];
  dropOffPoints?: string[];
  travelDate: Date;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  vehicleType: string;
  price: number;
  rating: number;
};

export type Profile = {
    name: string;
    mobile: string;
    email: string;
    planExpiryDate?: Date;
    role?: 'owner' | 'passenger' | 'admin';
}


// Zod Schemas for Distance Calculator AI Flow
export const CalculateDistanceInputSchema = z.object({
  from: z.string().min(2, '"From" location is required.'),
  to: z.string().min(2, '"To" location is required.'),
});
export type CalculateDistanceInput = z.infer<typeof CalculateDistanceInputSchema>;


export const CalculateDistanceOutputSchema = z.object({
    distance: z.number().describe('The approximate driving distance in kilometers.'),
});
export type CalculateDistanceOutput = z.infer<typeof CalculateDistanceOutputSchema>;
