import { AppLayout } from "@/components/layout/app-layout";
import StatCards from "@/components/dashboard/stat-cards";
import RecentBookings from "@/components/dashboard/recent-bookings";
import BookingForm from "@/components/dashboard/booking-form";

export default function Home() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold tracking-tight md:hidden">
          Dashboard
        </h2>
        <StatCards />
        <RecentBookings />
        <BookingForm />
      </div>
    </AppLayout>
  );
}
