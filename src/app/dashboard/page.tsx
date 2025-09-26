
"use client";

import { useState, useEffect, Suspense } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import OwnerDashboard from "@/components/dashboard/owner-dashboard";
import PassengerDashboard from "@/components/dashboard/passenger-dashboard";
import { useSearchParams, useRouter } from "next/navigation";
import type { OwnerFormValues } from "@/components/dashboard/owner-dashboard";
import { addRoute, getCurrentUser } from "@/lib/storage";
import type { Profile } from "@/lib/types";
import { Loader2 } from "lucide-react";


function DashboardPage({ profile }: { profile: Profile | null }) {
  const router = useRouter();

  const handleAddRoute = async (newRouteData: OwnerFormValues & { isPromoted?: boolean, distance?: number }) => {
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
     if (tab === 'profile' && profile?.role) {
      router.push(`/profile?role=${profile.role}`);
    }
  };

  if (!profile) {
      return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
      );
  }

  return (
      <>
      {profile.role === 'owner' ? (
        <OwnerDashboard onRouteAdded={handleAddRoute} onSwitchTab={handleSwitchTab} profile={profile} />
      ) : (
        <PassengerDashboard onSwitchTab={handleSwitchTab} profile={profile} />
      )}
      </>
  );
}


export default function Dashboard() {
  return (
    <AppLayout>
      {(profile) => (
        <Suspense fallback={<div>Loading...</div>}>
          <DashboardPage profile={profile} />
        </Suspense>
      )}
    </AppLayout>
  )
}
