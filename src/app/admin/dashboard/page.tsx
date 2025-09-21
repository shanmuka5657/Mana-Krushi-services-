
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Route, Book, IndianRupee, Eye, Signal, Image as ImageIcon, Upload, Loader2, Wand2 } from "lucide-react";
import { getRoutes, getBookings, getAllProfiles, getVisitorCount, getLiveVisitorsCount, saveGlobalLogoUrl, getGlobalLogoUrlWithCache as getGlobalLogoUrl } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cropLogo } from "@/app/actions";
import Link from "next/link";
import Image from "next/image";

const StatCard = ({ title, value, icon: Icon, href }: { title: string, value: string | number, icon: React.ElementType, href?: string }) => {
    const cardContent = (
        <Card className={href ? "hover:bg-muted/50 transition-colors" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );

    return href ? <Link href={href}>{cardContent}</Link> : <div>{cardContent}</div>;
};


function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoutes: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalVisitors: 0,
    liveVisitors: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAdminData = async () => {
      const [profiles, routes, bookings, visitors, liveVisitors, currentLogo] = await Promise.all([
        getAllProfiles(),
        getRoutes(true),
        getBookings(true),
        getVisitorCount(),
        getLiveVisitorsCount(),
        getGlobalLogoUrl(),
      ]);
      
      setLogoUrl(currentLogo);

      const bookingRevenue = bookings
        .filter(b => b.paymentStatus === 'Paid')
        .reduce((sum, b) => sum + (b.amount || 0), 0);
      
      const subscriptionRevenue = profiles.filter(p => p.role === 'owner' && p.planExpiryDate).length * 50;

      const totalRevenue = bookingRevenue + subscriptionRevenue;
      
      setStats({
        totalUsers: profiles.length,
        totalRoutes: routes.length,
        totalBookings: bookings.length,
        totalRevenue: totalRevenue,
        totalVisitors: visitors,
        liveVisitors: liveVisitors,
      });

      setIsLoaded(true);
    };
    fetchAdminData();
    
    // Auto-refresh live visitors every 30 seconds
    const intervalId = setInterval(async () => {
        const liveVisitors = await getLiveVisitorsCount();
        setStats(prevStats => ({ ...prevStats, liveVisitors }));
    }, 30000);

    return () => clearInterval(intervalId);

  }, []);
  
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 4 * 1024 * 1024) { // 4MB limit for genAI
            toast({
                title: "File too large",
                description: "Please upload an image smaller than 4MB.",
                variant: "destructive"
            });
            return;
        }

        const reader = new FileReader();
        reader.onloadstart = () => setIsUploading(true);
        reader.onloadend = async () => {
            const dataUrl = reader.result as string;
            
            toast({
                title: "AI is enhancing your logo...",
                description: "This might take a moment.",
            });

            const result = await cropLogo({ photoDataUri: dataUrl });

            if (result.error || !result.croppedLogoUrl) {
                await saveGlobalLogoUrl(dataUrl); // Save original if AI fails
                setLogoUrl(dataUrl);
                toast({
                    title: "AI enhancement failed, using original logo.",
                    description: result.error || "An unknown error occurred during cropping.",
                    variant: "destructive",
                });
            } else {
                await saveGlobalLogoUrl(result.croppedLogoUrl);
                setLogoUrl(result.croppedLogoUrl);
                toast({
                    title: "Logo Updated!",
                    description: "The application logo has been enhanced and updated.",
                });
            }
            
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    }
  };


  if (!isLoaded) {
    return <AppLayout><div>Loading admin dashboard...</div></AppLayout>;
  }

  return (
    <AppLayout>
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard title="Total Visitors" value={stats.totalVisitors} icon={Eye} href="/admin/visitors" />
                <StatCard title="Live Visitors" value={stats.liveVisitors} icon={Signal} />
                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} href="/admin/users" />
                <StatCard title="Total Routes" value={stats.totalRoutes} icon={Route} href="/admin/routes" />
                <StatCard title="Total Bookings" value={stats.totalBookings} icon={Book} href="/admin/bookings" />
                <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} icon={IndianRupee} href="/admin/payments" />
            </div>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ImageIcon /> Branding</CardTitle>
                    <CardDescription>Set the global app logo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col items-center">
                    {logoUrl ? (
                        <Image src={logoUrl} alt="Current App Logo" width={96} height={96} className="rounded-full object-cover h-24 w-24 border p-1" />
                    ) : (
                         <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                    <Button asChild variant="outline">
                        <label htmlFor="logo-upload" className="cursor-pointer">
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Upload & Enhance
                            <Input id="logo-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleLogoUpload} />
                        </label>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
  );
}

export default function AdminDashboard() {
    return <AdminDashboardPage />;
}
