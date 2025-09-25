
"use client";

import { useState, useEffect, Suspense } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import OwnerDashboard from "@/components/dashboard/owner-dashboard";
import PassengerDashboard from "@/components/dashboard/passenger-dashboard";
import { useSearchParams, useRouter } from "next/navigation";
import type { OwnerFormValues } from "@/components/dashboard/owner-dashboard";
import { addRoute, getCurrentUser, getProfile } from "@/lib/storage";
import type { Profile } from "@/lib/types";
import { Loader2 } from "lucide-react";


function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const determineRoleAndProfile = async () => {
        const userProfile = await getProfile();
        
        if (userProfile?.role === 'admin') {
            router.replace('/admin/dashboard');
            return;
        }

        setProfile(userProfile);
        
        const roleFromUrl = searchParams.get("role");
        // Ensure the URL reflects the true role from the profile.
        if (userProfile?.role && (!roleFromUrl || roleFromUrl !== userProfile.role)) {
             router.replace(`/dashboard?role=${userProfile.role}`);
        }
        setIsLoading(false);
    };
    determineRoleAndProfile();
  }, [searchParams, router]);


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
     if (tab === 'profile' && profile?.role) {
      router.push(`/profile?role=${profile.role}`);
    }
  };

  if (isLoading || !profile) {
      return (
        <AppLayout>
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </AppLayout>
      );
  }

  return (
    <AppLayout>
      {profile.role === 'owner' ? (
        <OwnerDashboard onRouteAdded={handleAddRoute} onSwitchTab={handleSwitchTab} profile={profile} />
      ) : (
        <PassengerDashboard onSwitchTab={handleSwitchTab} profile={profile} />
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
