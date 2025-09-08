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
} from "lucide-react";
import * as React from "react";

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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: "#", icon: LayoutDashboard, label: "Dashboard", active: true },
    { href: "#", icon: Users, label: "Clients" },
    { href: "#", icon: Plane, label: "Bookings" },
    { href: "#", icon: Map, label: "Itineraries" },
    { href: "#", icon: DollarSign, label: "Payments" },
    { href: "#", icon: BarChart, label: "Reports" },
    { href: "#", icon: Settings, label: "Settings" },
    { href: "#", icon: HelpCircle, label: "Help" },
  ];

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
                  href={item.href}
                  isActive={item.active}
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
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border">
                <AvatarImage
                  src="https://ui-avatars.com/api/?name=Sarah+Johnson&background=f39c12&color=fff"
                  alt="Sarah Johnson"
                />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div className="hidden text-sm md:block">
                <div className="font-semibold">Sarah Johnson</div>
                <div className="text-muted-foreground">Travel Agent</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
