
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
  Link,
  MapPin,
  Gamepad2,
  Timer,
  AlertCircle,
  PanelLeft,
  Wallet,
} from "lucide-react";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

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
import { clearCurrentUser, getCurrentUserName, getCurrentUser, getCurrentUserRole, getProfile } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import type { Profile } from "@/lib/types";


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
  const [userName, setUserName] = React.useState("User");
  const [userRole, setUserRole] = React.useState("Passenger");
  const [userInitial, setUserInitial] = React.useState("U");
  const [role, setRole] = React.useState('passenger');
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  
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
    const loadData = async () => {
      const name = getCurrentUserName();
      const email = getCurrentUser();
      const roleFromSession = getCurrentUserRole() || 'passenger';
      setRole(roleFromSession);
      const userProfile = await getProfile();
      setProfile(userProfile);

      if (roleFromSession === 'admin') {
        setUserName('Admin');
        setUserInitial('A');
        setUserRole('Administrator');
      } else {
        if (name) {
          setUserName(name);
          setUserInitial(name.charAt(0).toUpperCase());
        } else if (email) {
          const fallbackName = email.split('@')[0];
          setUserName(fallbackName);
          setUserInitial(fallbackName.charAt(0).toUpperCase());
        }
        setUserRole(roleFromSession === 'owner' ? 'Owner' : 'Passenger');
      }
    };
    loadData();
  }, []);

  const adminNavItems = [
    { href: `/admin/dashboard`, icon: Home, label: "Home" },
    { href: `/admin/users`, icon: Users, label: "Users" },
    { href: `/admin/routes`, icon: RouteIcon, label: "All Routes" },
    { href: `/admin/bookings`, icon: Book, label: "All Bookings" },
    { href: `/admin/payments`, icon: IndianRupee, label: "All Payments" },
    { href: `/admin/reports`, icon: AlertCircle, label: "All Reports" },
    { href: `/games`, icon: Gamepad2, label: "Games" },
    { href: `/entertainment`, icon: Film, label: "Entertainment" },
    { href: `/settings?role=admin`, icon: Settings, label: "Settings" },
  ];

  const ownerNavItems = [
    { href: `/dashboard?role=owner`, icon: Home, label: "Home" },
    { href: `/profile?role=owner`, icon: User, label: "Profile" },
    { href: `/my-routes?role=owner`, icon: RouteIcon, label: "My Routes" },
    { href: `/clients?role=owner`, icon: Users, label: "Passengers" },
    { href: `/payments?role=owner`, icon: IndianRupee, label: "Payments" },
    { href: `/profit-loss?role=owner`, icon: Wallet, label: "Profit/Loss" },
    { href: `/games`, icon: Gamepad2, label: "Games" },
    { href: `/entertainment?role=owner`, icon: Film, label: "Entertainment" },
    { href: `/settings?role=owner`, icon: Settings, label: "Settings" },
    { href: `/help?role=owner`, icon: HelpCircle, label: "Help" },
  ];

  const passengerNavItems = [
    { href: `/dashboard?role=passenger`, icon: Home, label: "Home" },
    { href: `/profile?role=passenger`, icon: User, label: "Profile" },
    { href: `/bookings?role=passenger`, icon: Plane, label: "Bookings" },
    { href: `/games`, icon: Gamepad2, label: "Games" },
    { href: `/reports?role=passenger`, icon: BarChart, label: "Reports" },
    { href: `/entertainment?role=passenger`, icon: Film, label: "Entertainment" },
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


  const handleLogout = () => {
    clearCurrentUser();
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
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
        const targetPath = pathname === '/ecommerce' ? '/ecommerce' : '/search';
        router.push(`${targetPath}?q=${searchQuery}`);
    }
  }


  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="size-8 text-accent" />
            <h1 className="text-xl font-bold">
              Mana Krushi<span className="text-accent">Services</span>
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
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
        <div className="flex flex-col h-screen">
          <header className="flex h-16 items-center justify-between border-b bg-transparent px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-8 sticky top-0 z-30 flex-shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden items-center gap-2 md:flex">
                <ToggleSidebarButton />
                <h2 className="text-2xl font-semibold">
                  {role === 'admin' ? 'Admin Panel' : (role === 'owner' ? 'Owner Dashboard' : 'Passenger Dashboard')}
                </h2>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-end gap-4">
              <div className="relative w-full max-w-xs sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={pathname === '/ecommerce' ? "Search for partners..." : "Search by driver, vehicle..."}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage
                        src={profile?.selfieDataUrl || `https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=f39c12&color=fff`}
                        alt={userName}
                      />
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
                  {role !== 'admin' && (
                    <DropdownMenuItem onClick={() => router.push(`/profile?role=${role}`)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  )}
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
          <main className="flex-1 p-4 md:p-8 overflow-y-auto" style={{ height: 'calc(100vh - 8rem)' }}>
            {children}
          </main>
          <footer className="h-32 flex-shrink-0 border-t bg-background">
              <iframe
                  className="w-full h-full border-none"
                  src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&loop=1&playlist=jfKfPfyJRdk"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
              ></iframe>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
