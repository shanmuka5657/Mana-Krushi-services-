
"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import OwnerDashboard from "@/components/dashboard/owner-dashboard";
import PassengerDashboard from "@/components/dashboard/passenger-dashboard";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import type { OwnerFormValues } from "@/components/dashboard/owner-dashboard";
import { addRoute, getCurrentUser } from "@/lib/storage";
import { useRouter } from "next/navigation";


function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") || "passenger"; 
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleAddRoute = async (newRouteData: OwnerFormValues & { pickupPoints?: string[], dropOffPoints?: string[], isPromoted?: boolean }) => {
    const ownerEmail = getCurrentUser();
     if (!ownerEmail) {
        console.error("Owner email not found, cannot add route.");
        return;
    }
    
    const routeWithOwner = {
        ...newRouteData,
        ownerEmail: ownerEmail,
    };

    await addRoute(routeWithOwner);
    router.push('/my-routes?role=owner');
  };
  
  const handleSwitchTab = (tab: string) => {
    // This function is kept for compatibility but is no longer used for tab switching.
    // It can be repurposed for other cross-component communication if needed.
     if (tab === 'profile') {
      router.push(`/profile?role=${role}`);
    }
  };

  if (!isClient) {
      return <AppLayout><div>Loading...</div></AppLayout>;
  }


  return (
    <AppLayout>
      {role === 'owner' ? (
        <OwnerDashboard onRouteAdded={handleAddRoute} onSwitchTab={handleSwitchTab} />
      ) : (
        <PassengerDashboard onSwitchTab={handleSwitchTab} />
      )}
    </AppLayout>
  );
}


export default function Dashboard() {
  return (
    <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
      <DashboardPage />
    </Suspense>
  )
}
