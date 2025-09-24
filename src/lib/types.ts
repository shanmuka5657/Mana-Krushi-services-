

import { z } from 'zod';

export type Booking = {
  id: string;
  bookingCode?: string;
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
  driverEmail?: string;
  driverMobile?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  paymentMethod?: "Cash" | "UPI" | "Pending";
  paymentStatus?: "Paid" | "Unpaid";
  report?: string;
  cancellationReason?: string;
  distance?: number;
  toll?: number;
  driverLatitude?: number;
  driverLongitude?: number;
  passengerLatitude?: number;
  passengerLongitude?: number;
};

export type Route = {
  id: string;
  ownerName: string;
  ownerEmail: string;
  driverName: string;
  driverMobile: string;
  fromLocation: string;
  toLocation: string;
  distance?: number;
  travelDate: Date;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  vehicleType?: string;
  vehicleNumber?: string;
  price: number;
  rating: number;
  isPromoted?: boolean;
};

export type Profile = {
    name: string;
    mobile: string;
    additionalMobiles?: string[];
    mobileVerified?: boolean;
    email: string;
    selfieDataUrl?: string;
    country?: string;
    address?: string;
    vehicleType?: string;
    vehicleNumber?: string;
    mileage?: number;
    planExpiryDate?: Date;
    role?: 'owner' | 'passenger' | 'admin';
    status?: 'active' | 'deleted';
    referralCode?: string;
    referredBy?: string;
}

export type MovieSite = {
    name: string;
    link: string;
}

export type VideoPlayerState = {
  videoId: string;
  isPlaying: boolean;
  timestamp: number;
  lastUpdated: Date;
}

export type Visit = {
  id: string;
  sessionId: string;
  userEmail: string;
  userName: string;
  role: string;
  path: string;
  timestamp: Date;
};

export type RouteView = {
    routeId: string;
    sessionId: string;
    timestamp: Date;
};


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

// Zod Schemas for Toll Calculator AI Flow
export const TollCalculatorInputSchema = z.object({
  from: z.string().describe('The starting point of the route.'),
  to: z.string().describe('The destination of the route.'),
});
export type TollCalculatorInput = z.infer<typeof TollCalculatorInputSchema>;

export const TollCalculatorOutputSchema = z.object({
  estimatedTollCost: z
    .number()
    .describe('The estimated total toll cost in Indian Rupees (INR) for the given route.'),
  estimatedTollCount: z
    .number()
    .int()
    .describe('The estimated number of toll plazas along the route.'),
});
export type TollCalculatorOutput = z.infer<typeof TollCalculatorOutputSchema>;
