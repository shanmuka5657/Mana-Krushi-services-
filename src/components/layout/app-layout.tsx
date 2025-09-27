
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
} from "lucide-react";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarProvider, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, Sidebar, SidebarTrigger, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";

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
  const [authUser, setAuthUser] = React.useState<FirebaseUser | null>(null);
  const [userName, setUserName] = React.useState("User");
  const [userRole, setUserRole] = React.useState("Passenger");
  const [userInitial, setUserInitial] = React.useState("U");
  const [role, setRole] = React.useState('passenger');
  const [logoUrl, setLogoUrl] = React.useState(placeholderImages.defaultLogo.url);
  const [perfCounts, setPerfCounts] = React.useState({ reads: 0, writes: 0 });
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);


   React.useEffect(() => {
    const unsubAuth = onAuthStateChanged(async (user) => {
        setIsAuthLoading(true);
        setAuthUser(user);
        if (user) {
            const userProfile = await getProfile(user.email!);
            setProfile(userProfile);
            const roleFromProfile = userProfile?.role || 'passenger';
            setRole(roleFromProfile);

            if (roleFromProfile === 'admin') {
                setUserName('Admin');
                setUserInitial('A');
                setUserRole('Administrator');
            } else {
                const name = userProfile?.name || user.displayName || user.email?.split('@')[0] || 'User';
                setUserName(name);
                setUserInitial(name.charAt(0).toUpperCase());
                setUserRole(roleFromProfile === 'owner' ? 'Owner' : 'Passenger');
            }
        } else {
            if (!['/disclaimer', '/privacy-policy', '/login', '/signup', '/'].includes(pathname)) {
                 router.push('/login');
            }
        }
        setIsAuthLoading(false);
    });
    
    perfTracker.subscribe(setPerfCounts);
    
    const fetchInitialLogo = async () => {
        const url = await getGlobalLogoUrlWithCache();
        if (url) {
            setLogoUrl(url);
        }
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


  const adminNavItems = [
    { href: `/admin/dashboard`, icon: Home, label: "Home" },
    { href: `/admin/profile`, icon: User, label: "Profile" },
    { href: `/admin/users`, icon: Users, label: "Users" },
    { href: `/admin/visitors`, icon: Eye, label: "Visitors" },
    { href: `/admin/routes`, icon: RouteIcon, label: "All Routes" },
    { href: `/admin/bookings`, icon: Book, label: "All Bookings" },
    { href: `/admin/payments`, icon: IndianRupee, label: "All Payments" },
    { href: `/admin/reports`, icon: AlertCircle, label: "All Reports" },
    { href: `/admin/messaging`, icon: Rss, label: "Campaigns" },
    { href: `/admin/database`, icon: Database, label: "Database" },
  ];

  const ownerNavItems = [
    { href: `/dashboard?role=owner`, icon: Home, label: "Home" },
    { href: `/my-routes?role=owner`, icon: RouteIcon, label: "My Routes" },
    { href: `/history?role=owner`, icon: History, label: "History" },
    { href: `/referral`, icon: Gift, label: "Referral" },
  ];

  const passengerNavItems = [
    { href: `/dashboard?role=passenger`, icon: Home, label: "Home" },
    { href: `/community`, icon: Users, label: "Community Hub" },
    { href: `/bookings?role=passenger`, icon: Plane, label: "Bookings" },
    { href: `/history?role=passenger`, icon: History, label: "History" },
    { href: `/referral`, icon: Gift, label: "Referral" },
  ];
  
  const footerNavItems = [
     { href: `/settings?role=${role}`, icon: Settings, label: "Settings" },
     { href: `/help?role=${role}`, icon: HelpCircle, label: "Help" },
     { href: `/privacy-policy?role=${role}`, icon: FileText, label: "Privacy Policy" },
  ]
  
  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return adminNavItems;
      case 'owner':
        return ownerNavItems;
      default:
        return passengerNavItems;
    }
  };

  const navItems = getNavItems();


  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };
  
  const handleNavClick = (href: string) => {
    setIsSheetOpen(false);
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(href);
    }
  };

  const renderNavMenu = (items: typeof navItems) => (
      <SidebarMenu>
          {isAuthLoading ? (
          <>
              {Array.from({ length: 9 }).map((_, index) => (
              <SidebarMenuSkeleton key={index} showIcon />
              ))}
          </>
          ) : (
              items.map((item) => (
              <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                  onClick={() => handleNavClick(item.href)}
                  isActive={pathname.startsWith(item.href.split('?')[0])}
                  className="justify-start"
                  >
                  <item.icon />
                  <span>{item.label}</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              ))
          )}
      </SidebarMenu>
  );
  
  return (
    <SidebarProvider>
        <div className="flex min-h-svh w-full flex-col bg-background">
            <header className="flex h-16 items-center justify-between border-b bg-transparent px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-8 sticky top-0 z-30 flex-shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                           <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden size-7"
                                aria-label="Toggle Menu"
                            >
                                <RouteIcon />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[18rem] bg-sidebar text-sidebar-foreground p-0 flex flex-col">
                           <SheetHeader className="p-2 border-b">
                                <SheetTitle>
                                    <div className="flex items-center gap-2">
                                        <div className="relative h-8 w-8">
                                            <Image src={logoUrl} alt="App Logo" fill className="rounded-full object-cover" />
                                        </div>
                                        <h2 className="text-lg font-bold">Mana Krushi</h2>
                                    </div>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 overflow-y-auto p-2">
                                {renderNavMenu(navItems)}
                            </div>
                             <div className="p-2 mt-auto border-t">
                                {renderNavMenu(footerNavItems)}
                            </div>
                        </SheetContent>
                    </Sheet>
                  
                  <div className="flex items-center gap-2 truncate">
                    <div className="relative h-8 w-8">
                        <Image src={logoUrl} alt="App Logo" fill className="rounded-full object-cover" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold truncate">
                      Mana Krushi
                    </h2>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center justify-end gap-4">
                   <div className="flex items-center gap-4 border rounded-full px-3 py-1.5 bg-muted/50 text-sm">
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
                       <DropdownMenuItem onClick={() => router.push(role === 'admin' ? '/admin/profile' : `/profile?role=${role}`)}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/settings?role=${role}`)}>
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
            </header>

            <div className="flex flex-1">
                <Sidebar className="hidden md:flex md:flex-col">
                    <SidebarContent>
                        {renderNavMenu(navItems)}
                    </SidebarContent>
                    <SidebarFooter>
                        {renderNavMenu(footerNavItems)}
                    </SidebarFooter>
                </Sidebar>
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
    </SidebarProvider>
  );
}


export function AppLayout({ children }: { children: React.ReactNode | ((profile: Profile | null) => React.ReactNode) }) {
    return <AppLayoutContent>{children}</AppLayoutContent>;
}
