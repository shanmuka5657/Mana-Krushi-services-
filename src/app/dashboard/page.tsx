
"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import OwnerDashboard from "@/components/dashboard/owner-dashboard";
import PassengerDashboard from "@/components/dashboard/passenger-dashboard";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from 'react';
import type { OwnerFormValues } from "@/components/dashboard/owner-dashboard";
import { addRoute, getCurrentUser, getProfile } from "@/lib/storage";
import React from "react";


function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleFromUrl = searchParams.get("role");
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const determineRole = async () => {
        const userProfile = await getProfile();
        let actualRole = userProfile?.role || 'passenger';

        // Override role if it's explicitly in the URL, but respect admin role from profile
        if (roleFromUrl && actualRole !== 'admin') {
            actualRole = roleFromUrl;
        }
        
        if (actualRole === 'admin') {
            router.replace('/admin/dashboard');
            // Don't set role or stop loading, to prevent rendering anything on this page
            return;
        }

        setRole(actualRole);
        // Update URL to reflect the correct role if it's not already set
        if (!roleFromUrl || roleFromUrl !== actualRole) {
             router.replace(`/dashboard?role=${actualRole}`);
        }
        setIsLoading(false);
    };
    determineRole();
  }, [roleFromUrl, router]);


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

  if (isLoading || !role) {
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
