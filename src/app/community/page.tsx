"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Suspense } from 'react';

function CommunityPageContent() {
    return (
        <AppLayout>
            <div>This page has been removed.</div>
        </AppLayout>
    );
}

export default function CommunityPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <CommunityPageContent />
        </Suspense>
    );
}
