

"use client";

import {
  Briefcase,
  HelpCircle,
  Home,
  Route as RouteIcon,
  Settings,
  Users,
  User,
  LogOut,
  Plane,
  Shield,
  Book,
  Loader2,
  Gift,
  Activity,
  ArrowDown,
  ArrowUp,
  FileText,
  History,
  Rss,
  Database,
  Eye,
  IndianRupee,
  Wallet,
  AlertCircle,
} from "lucide-react";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { onGlobalLogoUrlChange, getProfile, getGlobalLogoUrlWithCache } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import type { Profile } from "@/lib/types";
import placeholderImages from '@/lib/placeholder-images.json';
import { signOut, onAuthStateChanged } from '@/lib/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { perfTracker } from "@/lib/perf-tracker";


function AppLayoutContent({ children }: { children: React.ReactNode | ((profile: Profile | null) => React.ReactNode) }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const [logoUrl, setLogoUrl] = React.useState(placeholderImages.defaultLogo.url);
  const [perfCounts, setPerfCounts] = React.useState({ reads: 0, writes: 0 });

  React.useEffect(() => {
    const unsubAuth = onAuthStateChanged(async (user) => {
        setIsAuthLoading(true);
        const publicPages = ['/disclaimer', '/privacy-policy', '/login', '/signup', '/'];
        const isPublicPage = publicPages.includes(pathname);

        if (user) {
            const userProfile = await getProfile(user.email!);
            setProfile(userProfile);
        } else {
            setProfile(null);
            if (!isPublicPage) {
                 router.push('/login');
            }
        }
        setIsAuthLoading(false);
    });
    
    perfTracker.subscribe(setPerfCounts);
    
    const fetchInitialLogo = async () => {
        const url = await getGlobalLogoUrlWithCache();
        if (url) setLogoUrl(url);
    };
    
    fetchInitialLogo();
    
    const unsubLogo = onGlobalLogoUrlChange((url) => {
        if(url) setLogoUrl(url);
    });

    return () => { 
        unsubAuth();
        unsubLogo();
    };
  }, [router, pathname]);


  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const userName = profile?.name || 'User';
  const userRole = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Guest';
  const userInitial = userName.charAt(0).toUpperCase();

  
  return (
        <div className="flex min-h-svh w-full flex-col bg-background">
            <header className="flex h-16 items-center justify-between border-b bg-transparent px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-8 sticky top-0 z-30 flex-shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 truncate" onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
                    <div className="relative h-8 w-8">
                        <Image src={logoUrl} alt="App Logo" fill className="rounded-full object-cover" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold truncate">
                      Mana Krushi
                    </h2>
                  </div>
                </div>
                {profile && (
                    <div className="flex flex-shrink-0 items-center justify-end gap-4">
                    <div className="hidden sm:flex items-center gap-4 border rounded-full px-3 py-1.5 bg-muted/50 text-sm">
                        <div className="flex items-center gap-2" title="Database Reads (Session)">
                            <ArrowDown className="h-4 w-4 text-green-500" />
                            <span className="font-mono">{perfCounts.reads}</span>
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center gap-2" title="Database Writes (Session)">
                            <ArrowUp className="h-4 w-4 text-orange-500" />
                            <span className="font-mono">{perfCounts.writes}</span>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 cursor-pointer">
                            <Avatar className="h-10 w-10 border">
                            <AvatarImage src={profile?.selfieDataUrl} alt={userName} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                            </Avatar>
                            <div className="hidden text-sm md:block">
                            <div className="font-semibold">{userName}</div>
                            <div className="text-muted-foreground">{userRole}</div>
                            </div>
                        </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(profile.role === 'admin' ? '/admin/profile' : `/profile?role=${profile.role}`)}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/history?role=${profile.role}`)}>
                            <History className="mr-2 h-4 w-4" />
                            <span>Booking History</span>
                            </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/settings?role=${profile.role}`)}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                )}
            </header>

            <div className="flex flex-1">
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {isAuthLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    typeof children === 'function' ? children(profile) : children
                )}
                </main>
            </div>
        </div>
  );
}


export function AppLayout({ children }: { children: React.ReactNode | ((profile: Profile | null) => React.ReactNode) }) {
    return <AppLayoutContent>{children}</AppLayoutContent>;
}
