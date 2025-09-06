export type Booking = {
  id: string;
  client: string;
  destination: string;
  departureDate: Date;
  returnDate: Date;
  amount: number;
  status: "Confirmed" | "Pending" | "Cancelled";
  travelers: string;
  mobile: string;
};
