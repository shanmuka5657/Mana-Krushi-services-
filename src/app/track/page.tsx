
"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getBookings } from '@/lib/storage';
import type { Booking } from '@/lib/types';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';

function TrackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    const fetchBooking = async () => {
      const allBookings = await getBookings(true);
      const foundBooking = allBookings.find(b => b.id === bookingId);
      if (foundBooking) {
        setBooking(foundBooking);
      }
      setLoading(false);
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
        <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (!bookingId || !booking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Ride</CardTitle>
          <CardDescription>You don't have an active ride to track.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center py-10">
          <MapPin className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Once you book a ride, you can track it here.</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard?role=passenger')}>Find a Ride</Button>
        </CardContent>
      </Card>
    );
  }
  
  // If we have a booking, redirect to the specific tracking page.
  // This component will evolve to show the actual tracking UI in the next steps.
  router.replace(`/track/${booking.id}`);
  
  return (
     <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading your ride...</p>
    </div>
  );
}

export default function TrackPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <TrackPageContent />
      </Suspense>
    </AppLayout>
  );
}
