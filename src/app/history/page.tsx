
"use client";

import { Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import RecentBookings from '@/components/dashboard/recent-bookings';


function HistoryPageContent() {
    return (
        <AppLayout>
            <RecentBookings initialBookings={[]} mode="past" />
        </AppLayout>
    );
}

export default function HistoryPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <HistoryPageContent />
        </Suspense>
    );
}
