

"use client";

import {
  BarChart,
  Briefcase,
  IndianRupee,
  HelpCircle,
  Home,
  LayoutDashboard,
  Map,
  Route as RouteIcon,
  Search,
  Settings,
  Users,
  User,
  LogOut,
  Plane,
  Download,
  Shield,
  Book,
  Loader2,
  Film,
  ShoppingCart,
  MonitorPlay,
  Link as LinkIcon,
  MapPin,
  Gamepad2,
  Timer,
  AlertCircle,
  PanelLeft,
  Wallet,
  Eye,
  Youtube,
  Signal,
  Tv,
  MessageSquare,
  Gift,
  History,
  Database,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { onGlobalLogoUrlChange, getProfile, onAdsEnabledChange } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import type { Profile } from "@/lib/types";
import placeholderImages from '@/lib/placeholder-images.json';
import { signOut, onAuthStateChanged } from '@/lib/auth';
import type { User as FirebaseUser } from 'firebase/auth';


// Define the interface for the event, as it's not standard in all TS lib versions.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}


export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [authUser, setAuthUser] = React.useState<FirebaseUser | null>(null);
  const [userName, setUserName] = React.useState("User");
  const [userRole, setUserRole] = React.useState("Passenger");
  const [userInitial, setUserInitial] = React.useState("U");
  const [role, setRole] = React.useState('passenger');
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState(placeholderImages.defaultLogo.url);
  
  // We need to wrap the trigger in a component to use the useSidebar hook.
  const ToggleSidebarButton = () => {
    const { toggleSidebar } = useSidebar()
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => toggleSidebar()}
        aria-label="Toggle Sidebar"
      >
        <PanelLeft />
      </Button>
    )
  }


  React.useEffect(() => {
    // This will only run on the client
    if(window.matchMedia('(display-mode: standalone)').matches) {
        setIsStandalone(true);
    }
    
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  React.useEffect(() => {
    setIsMounted(true);

    const unsubAuth = onAuthStateChanged(async (user) => {
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
            // If user is not authenticated, redirect to login page
            // Allow access to public pages like /disclaimer
            if (!['/disclaimer'].includes(pathname)) {
                 router.push('/login');
            }
        }
    });

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
    { href: `/admin/video-views`, icon: Youtube, label: "Video Views" },
    { href: `/admin/routes`, icon: RouteIcon, label: "All Routes" },
    { href: `/admin/bookings`, icon: Book, label: "All Bookings" },
    { href: `/admin/payments`, icon: IndianRupee, label: "All Payments" },
    { href: `/admin/reports`, icon: AlertCircle, label: "All Reports" },
    { href: `/admin/messaging`, icon: MessageSquare, label: "Bulk Messaging" },
    { href: `/games`, icon: Gamepad2, label: "Games" },
    { href: `/live`, icon: Tv, label: "Live" },
    { href: `/entertainment`, icon: Film, label: "Entertainment" },
    { href: `/watch`, icon: LinkIcon, label: "Watch" },
    { href: `/ads`, icon: MonitorPlay, label: "Ads" },
    { href: `/loans`, icon: IndianRupee, label: "Loans" },
    { href: `/insurance`, icon: Shield, label: "Insurance" },
    { href: `/ecommerce`, icon: ShoppingCart, label: "E-commerce" },
    { href: `/settings?role=admin`, icon: Settings, label: "Settings" },
  ];

  const ownerNavItems = [
    { href: `/dashboard?role=owner`, icon: Home, label: "Home" },
    { href: `/profile?role=owner`, icon: User, label: "Profile" },
    { href: `/my-routes?role=owner`, icon: RouteIcon, label: "My Routes" },
    { href: `/clients?role=owner`, icon: Users, label: "Passengers" },
    { href: `/payments?role=owner`, icon: IndianRupee, label: "Payments" },
    { href: `/profit-loss?role=owner`, icon: Wallet, label: "Profit/Loss" },
    { href: `/history?role=owner`, icon: History, label: "History" },
    { href: `/referral`, icon: Gift, label: "Referral" },
    { href: `/games`, icon: Gamepad2, label: "Games" },
    { href: `/live`, icon: Tv, label: "Live" },
    { href: `/entertainment?role=owner`, icon: Film, label: "Entertainment" },
    { href: `/watch?role=owner`, icon: LinkIcon, label: "Watch" },
    { href: `/ads`, icon: MonitorPlay, label: "Ads" },
    { href: `/loans?role=owner`, icon: IndianRupee, label: "Loans" },
    { href: `/insurance?role=owner`, icon: Shield, label: "Insurance" },
    { href: `/ecommerce?role=owner`, icon: ShoppingCart, label: "E-commerce" },
    { href: `/settings?role=owner`, icon: Settings, label: "Settings" },
    { href: `/help?role=owner`, icon: HelpCircle, label: "Help" },
  ];

  const passengerNavItems = [
    { href: `/dashboard?role=passenger`, icon: Home, label: "Home" },
    { href: `/profile?role=passenger`, icon: User, label: "Profile" },
    { href: `/bookings?role=passenger`, icon: Plane, label: "Bookings" },
    { href: `/history?role=passenger`, icon: History, label: "History" },
    { href: `/referral`, icon: Gift, label: "Referral" },
    { href: `/games`, icon: Gamepad2, label: "Games" },
    { href: `/live`, icon: Tv, label: "Live" },
    { href: `/reports?role=passenger`, icon: BarChart, label: "Reports" },
    { href: `/entertainment?role=passenger`, icon: Film, label: "Entertainment" },
    { href: `/watch?role=passenger`, icon: LinkIcon, label: "Watch" },
    { href: `/ads`, icon: MonitorPlay, label: "Ads" },
    { href: `/loans?role=passenger`, icon: IndianRupee, label: "Loans" },
    { href: `/insurance?role=passenger`, icon: Shield, label: "Insurance" },
    { href: `/ecommerce?role=passenger`, icon: ShoppingCart, label: "E-commerce" },
    { href: `/settings?role=passenger`, icon: Settings, label: "Settings" },
    { href: `/help?role=passenger`, icon: HelpCircle, label: "Help" },
  ];
  
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
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(href);
    }
  };
  
  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setIsStandalone(true);
          toast({ title: "Installation Complete!", description: "The app has been successfully installed." });
        } else {
           toast({ title: "Installation Cancelled", variant: "destructive" });
        }
        setInstallPrompt(null);
      });
    }
  };


  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Image src={logoUrl} alt="App Logo" width={32} height={32} className="rounded-full" />
            <h1 className="text-xl font-bold">
              Mana Krushi<span className="text-accent">Services</span>
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {isMounted && navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  onClick={() => handleNavClick(item.href)}
                  isActive={pathname.startsWith(item.href.split('?')[0])}
                  className="justify-start"
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            {!isStandalone && (
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            className="justify-start" 
                            tooltip="Install App" 
                            onClick={handleInstallClick}
                            disabled={!installPrompt}
                        >
                           <Download />
                           <span>Install App</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex flex-col flex-1 h-full">
          <header className="flex h-16 items-center justify-between border-b bg-transparent px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-8 sticky top-0 z-30 flex-shrink-0">
             <div className="flex items-center gap-2 flex-1 min-w-0">
              <SidebarTrigger className="md:hidden" />
               <div className="hidden md:flex items-center gap-2">
                <ToggleSidebarButton />
              </div>
              <div className="flex items-center gap-2 truncate">
                <Image src={logoUrl} alt="App Logo" width={32} height={32} className="rounded-full" />
                <h2 className="text-xl md:text-2xl font-semibold truncate">
                  Mana Krushi Services
                </h2>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center justify-end gap-4">
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
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
