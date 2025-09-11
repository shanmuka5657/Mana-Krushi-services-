
"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentBookings from "@/components/dashboard/recent-bookings";
import type { Booking, Route } from "@/lib/types";
import type { OwnerFormValues } from "@/components/dashboard/owner-dashboard";
import OwnerDashboard from "@/components/dashboard/owner-dashboard";
import PassengerDashboard from "@/components/dashboard/passenger-dashboard";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import { getBookings, saveBookings, getRoutes, addRoute, getCurrentUserName, getCurrentUser } from "@/lib/storage";
import MyRoutes from "@/components/dashboard/my-routes";
import ProfileForm from "@/components/dashboard/profile-form";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";

function KotakBanner() {
    return (
        <a href="https://clnk.in/w6hB" target="_blank" rel="noopener noreferrer" className="block w-full group mb-6">
            <Card className="w-full overflow-hidden relative text-white bg-blue-900 aspect-[4/1] md:aspect-[5/1]">
                 <Image 
                    src="https://picsum.photos/seed/kotak-account/1200/240"
                    alt="Kotak 811 Digital Savings Account"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-20"
                    data-ai-hint="bank account"
                />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg md:text-2xl font-bold">Kotak 811 Digital Savings Account</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-md">Open a zero balance savings account online in minutes.</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-blue-900 hover:bg-gray-100 text-xs md:text-sm">
                        Open Account
                    </Button>
                </div>
            </Card>
        </a>
    )
}

function PoonawallaBanner() {
    return (
        <a href="https://clnk.in/w6hE" target="_blank" rel="noopener noreferrer" className="block w-full group mt-6">
            <Card className="w-full overflow-hidden relative text-white bg-green-900 aspect-[4/1] md:aspect-[5/1]">
                 <Image 
                    src="https://picsum.photos/seed/poonawalla-loan/1200/240"
                    alt="Poonawalla Fincorp Instant Loan"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-20"
                    data-ai-hint="finance loan"
                />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg md:text-2xl font-bold">Poonawalla Fincorp Instant Loan</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-md">Get instant personal loans with attractive interest rates.</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-green-900 hover:bg-gray-100 text-xs md:text-sm">
                        Apply Now
                    </Button>
                </div>
            </Card>
        </a>
    )
}


function DashboardPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "passenger"; 
  const defaultTab = role === 'owner' ? 'add-route' : 'find-ride';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [bookingsFromStorage, allRoutes] = await Promise.all([getBookings(), getRoutes()]);
      
      setAllBookings(bookingsFromStorage);
      const currentUserName = getCurrentUserName();
      const currentUserEmail = getCurrentUser();

      if (role === 'passenger') {
        const filteredBookings = currentUserEmail ? bookingsFromStorage.filter(b => b.clientEmail === currentUserEmail) : [];
        setUserBookings(filteredBookings);
      } else {
        const ownerName = getCurrentUserName();
        const ownerRoutes = ownerName ? allRoutes.filter(r => r.ownerName === ownerName) : [];
        setRoutes(ownerRoutes);
        const ownerBookings = ownerName ? bookingsFromStorage.filter(b => b.driverName === ownerName) : [];
        setUserBookings(ownerBookings);
      }

      setIsLoaded(true);
    };
    fetchData();
  }, [role]);

  const handleAddRoute = async (newRouteData: OwnerFormValues & { pickupPoints?: string[], dropOffPoints?: string[] }) => {
    const ownerName = getCurrentUserName();
    if (!ownerName) {
        console.error("Owner name not found, cannot add route.");
        return;
    }
    
    const routeWithOwner = {
        ...newRouteData,
        ownerName: ownerName,
    };

    const newRoute = await addRoute(routeWithOwner);
    setRoutes((prevRoutes) => [newRoute, ...prevRoutes]);
  };
  
  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
  };
  
  const handleUpdateBooking = async (updatedBooking: Booking) => {
    const updatedAllBookings = allBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
    await saveBookings(updatedAllBookings);
    setAllBookings(updatedAllBookings);
    const currentUserEmail = getCurrentUser();
    if (role === 'passenger') {
      setUserBookings(currentUserEmail ? updatedAllBookings.filter(b => b.clientEmail === currentUserEmail) : []);
    } else {
      const ownerName = getCurrentUserName();
      const ownerBookings = ownerName ? updatedAllBookings.filter(b => b.driverName === ownerName) : [];
      setUserBookings(ownerBookings);
    }
  };


  if (!isLoaded) {
    return <AppLayout><div>Loading...</div></AppLayout>;
  }

  return (
    <AppLayout>
      {role === 'owner' ? (
         <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={handleTabSwitch}>
          <TabsList>
            <TabsTrigger value="add-route">Add Route</TabsTrigger>
            <TabsTrigger value="my-routes">My Routes</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="add-route">
             <OwnerDashboard onRouteAdded={handleAddRoute} onSwitchTab={handleTabSwitch} />
          </TabsContent>
          <TabsContent value="my-routes">
            <KotakBanner />
            <MyRoutes routes={routes} />
            <PoonawallaBanner />
          </TabsContent>
           <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={handleTabSwitch}>
          <TabsList>
            <TabsTrigger value="find-ride">Find a Ride</TabsTrigger>
            <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="find-ride">
            <PassengerDashboard onSwitchTab={handleTabSwitch} />
          </TabsContent>
          <TabsContent value="my-bookings">
            <KotakBanner />
            <RecentBookings bookings={userBookings} onUpdateBooking={handleUpdateBooking} />
            <PoonawallaBanner />
          </TabsContent>
           <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
        </Tabs>
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
