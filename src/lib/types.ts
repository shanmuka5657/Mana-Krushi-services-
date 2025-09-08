
export type Booking = {
  id: string;
  client: string;
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
};

export type Route = {
  id: string;
  ownerName: string;
  driverName: string;
  driverMobile: string;
  fromLocation: string;
  toLocation: string;
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
}
