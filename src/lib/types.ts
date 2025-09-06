export type Booking = {
  id: string;
  client: string;
  destination: string;
  date: string;
  amount: number;
  status: "Confirmed" | "Pending" | "Cancelled";
  travelers: string;
  mobile: string;
};
