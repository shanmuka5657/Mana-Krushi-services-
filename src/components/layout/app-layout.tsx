
"use client";

import {
  BarChart,
  Briefcase,
  DollarSign,
  HelpCircle,
  LayoutDashboard,
  Map,
  Plane,
  Search,
  Settings,
  Users,
  User,
  LogOut,
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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = React.useState("User");
  const [userRole, setUserRole] = React.useState("Passenger");
  const [userInitial, setUserInitial] = React.useState("U");
  const [role, setRole] = React.useState('passenger');

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

  const navItems = [
    { href: `/dashboard?role=${role}`, icon: LayoutDashboard, label: "Dashboard" },
    { href: `/profile?role=${role}`, icon: User, label: "Profile" },
    { href: `/bookings?role=${role}`, icon: Plane, label: "Bookings" },
    { href: `/clients?role=${role}`, icon: Users, label: "Clients", ownerOnly: true },
    { href: `/itineraries?role=${role}`, icon: Map, label: "Itineraries", ownerOnly: true },
    { href: `/payments?role=${role}`, icon: DollarSign, label: "Payments", ownerOnly: true },
    { href: `/reports?role=${role}`, icon: BarChart, label: "Reports" },
    { href: `/settings?role=${role}`, icon: Settings, label: "Settings" },
    { href: `/help?role=${role}`, icon: HelpCircle, label: "Help" },
  ].filter(item => !(item.ownerOnly && role !== 'owner'));

  const handleLogout = () => {
    clearCurrentUser();
    router.push('/login');
  };
  
  const handleNavClick = (href: string) => {
    router.push(href);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="size-8 text-accent" />
            <h1 className="text-xl font-bold">
              MK<span className="text-accent">travels</span>
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
