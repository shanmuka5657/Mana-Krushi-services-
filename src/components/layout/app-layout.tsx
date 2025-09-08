
"use client";

import {
  BarChart,
  Briefcase,
  DollarSign,
  HelpCircle,
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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearCurrentUser, getCurrentUserName, getCurrentUser } from "@/lib/storage";

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
  const [userName, setUserName] = React.useState("User");
  const [userRole, setUserRole] = React.useState("Passenger");
  const [userInitial, setUserInitial] = React.useState("U");
  const [role, setRole] = React.useState('passenger');
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);

  React.useEffect(() => {
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
    const name = getCurrentUserName();
    const email = getCurrentUser();
    if (name) {
      setUserName(name);
      setUserInitial(name.charAt(0).toUpperCase());
    } else if (email) {
      const fallbackName = email.split('@')[0];
      setUserName(fallbackName);
      setUserInitial(fallbackName.charAt(0).toUpperCase());
    }
    const roleFromUrl = new URLSearchParams(window.location.search).get('role') || 'passenger';
    setRole(roleFromUrl);
    setUserRole(roleFromUrl === 'owner' ? 'Owner' : 'Passenger');
  }, []);

  const ownerNavItems = [
    { href: `/dashboard?role=owner`, icon: LayoutDashboard, label: "Dashboard" },
    { href: `/profile?role=owner`, icon: User, label: "Profile" },
    { href: `/my-routes?role=owner`, icon: RouteIcon, label: "My Routes" },
    { href: `/clients?role=owner`, icon: Users, label: "Passengers" },
    { href: `/payments?role=owner`, icon: DollarSign, label: "Payments" },
    { href: `/reports?role=owner`, icon: BarChart, label: "Reports" },
    { href: `/settings?role=owner`, icon: Settings, label: "Settings" },
    { href: `/help?role=owner`, icon: HelpCircle, label: "Help" },
  ];

  const passengerNavItems = [
    { href: `/dashboard?role=passenger`, icon: LayoutDashboard, label: "Dashboard" },
    { href: `/profile?role=passenger`, icon: User, label: "Profile" },
    { href: `/bookings?role=passenger`, icon: Plane, label: "Bookings" },
    { href: `/reports?role=passenger`, icon: BarChart, label: "Reports" },
    { href: `/settings?role=passenger`, icon: Settings, label: "Settings" },
    { href: `/help?role=passenger`, icon: HelpCircle, label: "Help" },
  ];
  
  const navItems = role === 'owner' ? ownerNavItems : passengerNavItems;


  const handleLogout = () => {
    clearCurrentUser();
    router.push('/login');
  };
  
  const handleNavClick = (href: string) => {
    router.push(href);
  };
  
  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
      });
    }
  };


  return (
    <SidebarProvider>
      <Sidebar>
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
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton className="justify-start" tooltip="Install App" onClick={handleInstallClick} disabled={!installPrompt}>
                        <Download />
                        <span>Install App</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <h2 className="hidden text-2xl font-semibold md:block">
              Travel Agent Dashboard
            </h2>
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="relative w-full max-w-xs sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search bookings, clients..."
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=f39c12&color=fff`}
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
                <DropdownMenuItem onClick={() => router.push(`/profile?role=${role}`)}>
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
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
