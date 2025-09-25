
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import ProfitLossPageContent from '@/components/dashboard/profit-loss-page';
import { Suspense } from 'react';

function ProfitLossPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
           <ProfitLossPageContent />
        </Suspense>
    );
}

export default ProfitLossPage;
