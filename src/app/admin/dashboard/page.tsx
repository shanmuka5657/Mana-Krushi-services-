

"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Route, Book, IndianRupee, Eye, Signal, Image as ImageIcon, Upload, Loader2, Wand2, RefreshCw, ScreenShare } from "lucide-react";
import { getRoutes, getBookings, getAllProfiles, getVisits, saveGlobalLogoUrl, getGlobalLogoUrlWithCache as getGlobalLogoUrl, getPwaScreenshots } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cropLogo, uploadPwaScreenshots } from "@/app/actions";
import Link from "next/link";
import Image from "next/image";

const StatCard = ({ title, value, icon: Icon, href, onRefresh, isLoading }: { title: string, value: string | number, icon: React.ElementType, href?: string, onRefresh?: () => void, isLoading?: boolean }) => {
    const cardContent = (
        <Card className={href ? "hover:bg-muted/50 transition-colors" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="flex items-center gap-2">
                  {onRefresh && (
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRefresh} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  )}
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
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
  const [loadingStats, setLoadingStats] = useState({
      users: false,
      routes: false,
      bookings: false,
      revenue: false,
      visitors: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [pwaScreenshots, setPwaScreenshots] = useState<{src: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingScreenshots, setIsUploadingScreenshots] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      const [currentLogo, currentScreenshots] = await Promise.all([
          getGlobalLogoUrl(),
          getPwaScreenshots(),
      ]);
      setLogoUrl(currentLogo);
      setPwaScreenshots(currentScreenshots || []);
      setIsLoaded(true);
      
      fetchVisitorStats(true);
    };
    fetchInitialData();
    
    const intervalId = setInterval(() => fetchVisitorStats(true), 30000);
    return () => clearInterval(intervalId);

  }, []);
  
  const fetchAllStats = async () => {
    await Promise.all([
      fetchUserStats(),
      fetchRouteStats(),
      fetchBookingAndRevenueStats(),
      fetchVisitorStats(),
    ]);
  }
  
  const fetchUserStats = async () => {
      setLoadingStats(prev => ({...prev, users: true}));
      const profiles = await getAllProfiles();
      setStats(prev => ({...prev, totalUsers: profiles.length}));
      setLoadingStats(prev => ({...prev, users: false}));
  }
  
  const fetchRouteStats = async () => {
      setLoadingStats(prev => ({...prev, routes: true}));
      const routes = await getRoutes(true);
      setStats(prev => ({...prev, totalRoutes: routes.length}));
      setLoadingStats(prev => ({...prev, routes: false}));
  }

  const fetchBookingAndRevenueStats = async () => {
      setLoadingStats(prev => ({...prev, bookings: true, revenue: true}));
      const bookings = await getBookings(true);
      const bookingRevenue = bookings
        .filter(b => b.paymentStatus === 'Paid')
        .reduce((sum, b) => sum + (b.amount || 0), 0);
      
      const profiles = await getAllProfiles();
      const subscriptionRevenue = profiles.filter(p => p.role === 'owner' && p.planExpiryDate).length * 50;
      const totalRevenue = bookingRevenue + subscriptionRevenue;

      setStats(prev => ({
          ...prev, 
          totalBookings: bookings.length,
          totalRevenue,
      }));
      setLoadingStats(prev => ({...prev, bookings: false, revenue: false}));
  }

  const fetchVisitorStats = async (liveOnly = false) => {
      if (!liveOnly) setLoadingStats(prev => ({ ...prev, visitors: true }));
      const allVisits = await getVisits();
      const now = new Date();
      const activeSince = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes
      const activeSessions = new Set<string>();

      for (const visit of allVisits) {
          if (new Date(visit.timestamp) >= activeSince) {
              activeSessions.add(visit.sessionId);
          }
      }
      
      const uniqueTotalSessions = new Set(allVisits.map(v => v.sessionId));

      setStats(prev => ({
          ...prev,
          liveVisitors: activeSessions.size,
          totalVisitors: liveOnly ? prev.totalVisitors : uniqueTotalSessions.size,
      }));
      if (!liveOnly) setLoadingStats(prev => ({ ...prev, visitors: false }));
  }


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

  const handleScreenshotUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        setIsUploadingScreenshots(true);
        const screenshotPromises = Array.from(files).map(file => {
            return new Promise<{dataUrl: string, type: string}>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const img = document.createElement('img');
                    img.onload = () => {
                        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0);
                            const pngDataUrl = canvas.toDataURL('image/png');
                            resolve({ dataUrl: pngDataUrl, type: 'image/png' });
                        } else {
                            resolve({ dataUrl: reader.result as string, type: file.type });
                        }
                    };
                    img.onerror = reject;
                    img.src = reader.result as string;
                }
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(screenshotPromises).then(async (results) => {
            const screenshots = await Promise.all(results.map(async ({dataUrl, type}) => {
                const img = document.createElement('img');
                return new Promise<{src: string, sizes: string, type: string, form_factor: string}>((resolve) => {
                    img.onload = () => {
                        const form_factor = img.width > img.height ? "wide" : "narrow";
                        resolve({
                            src: dataUrl,
                            sizes: `${img.width}x${img.height}`,
                            type: type,
                            form_factor: form_factor,
                        });
                    }
                    img.src = dataUrl;
                });
            }));
            
            const result = await uploadPwaScreenshots({ screenshots });

            if (result.success) {
                setPwaScreenshots(screenshots);
                toast({
                    title: "Screenshots Updated",
                    description: "PWA screenshots have been successfully updated in your manifest.",
                });
            } else {
                toast({
                    title: "Error Uploading Screenshots",
                    description: result.error || "An unknown error occurred.",
                    variant: "destructive",
                });
            }

            setIsUploadingScreenshots(false);
        });
    }
  };


  if (!isLoaded) {
    return <AppLayout><div>Loading admin dashboard...</div></AppLayout>;
  }

  return (
    <AppLayout>
        <div className="space-y-8">
            <div className="flex justify-end">
                <Button onClick={fetchAllStats}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Load All Stats
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard title="Total Visitors" value={stats.totalVisitors} icon={Eye} href="/admin/visitors" onRefresh={() => fetchVisitorStats()} isLoading={loadingStats.visitors} />
                <StatCard title="Live Visitors" value={stats.liveVisitors} icon={Signal} />
                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} href="/admin/users" onRefresh={fetchUserStats} isLoading={loadingStats.users} />
                <StatCard title="Total Routes" value={stats.totalRoutes} icon={Route} href="/admin/routes" onRefresh={fetchRouteStats} isLoading={loadingStats.routes} />
                <StatCard title="Total Bookings" value={stats.totalBookings} icon={Book} href="/admin/bookings" onRefresh={fetchBookingAndRevenueStats} isLoading={loadingStats.bookings} />
                <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} icon={IndianRupee} href="/admin/payments" onRefresh={fetchBookingAndRevenueStats} isLoading={loadingStats.revenue} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ScreenShare /> PWA Screenshots</CardTitle>
                        <CardDescription>Upload screenshots for the PWA installation screen.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex flex-col items-center">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {pwaScreenshots.length > 0 ? pwaScreenshots.map((ss, index) => (
                                <Image key={index} src={ss.src} alt={`PWA Screenshot ${index + 1}`} width={80} height={160} className="object-contain h-40 w-auto border p-1 rounded-md" />
                            )) : (
                                <div className="h-40 w-full bg-muted rounded-md flex items-center justify-center">
                                    <p className="text-sm text-muted-foreground">No screenshots uploaded yet.</p>
                                </div>
                            )}
                        </div>
                        <Button asChild variant="outline">
                            <label htmlFor="screenshot-upload" className="cursor-pointer">
                                {isUploadingScreenshots ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Upload Screenshots
                                <Input id="screenshot-upload" type="file" multiple className="hidden" accept="image/png, image/jpeg" onChange={handleScreenshotUpload} />
                            </label>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </AppLayout>
  );
}

export default function AdminDashboard() {
    return <AdminDashboardPage />;
}
