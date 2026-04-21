"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  BarChart3,
  LayoutDashboard, 
  FileText, 
  History, 
  Settings, 
  LogOut,
  Users,
  Building2,
  ScrollText
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { OrgSwitcher } from "@/components/OrgSwitcher";

interface DashboardLayoutProps {
  children: ReactNode;
  mode?: "member" | "admin" | "super_admin";
}

export function DashboardLayout({ children, mode = "member" }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const memberItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Create Report", url: "/dashboard/create", icon: FileText },
    { title: "Organization", url: "/dashboard/organization", icon: Building2 },
    { title: "History", url: "/dashboard/history", icon: History },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];

  const adminItems = [
    { title: "Overview", url: "/admin", icon: LayoutDashboard },
    { title: "Create Report", url: "/admin/create", icon: FileText },
    { title: "Organization", url: "/dashboard/organization", icon: Building2 },
    { title: "View Reports", url: "/admin/reports", icon: History },
    { title: "Members", url: "/admin/members", icon: Users },
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ];

  const superAdminItems = [
    { title: "Overview", url: "/super-admin", icon: LayoutDashboard },
    { title: "Users", url: "/super-admin/users", icon: Users },
    { title: "Organizations", url: "/super-admin/organizations", icon: Building2 },
    { title: "Analytics", url: "/super-admin/analytics", icon: BarChart3 },
    { title: "Audit Logs", url: "/super-admin/audit-logs", icon: ScrollText },
    { title: "Settings", url: "/super-admin/settings", icon: Settings },
  ];

  const activeMode = mode !== "member" ? mode : (user?.role || "member");
  const items = activeMode === "super_admin" ? superAdminItems : activeMode === "admin" ? adminItems : memberItems;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="sidebar" className="border-r">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 px-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">Mr DocGen</span>
            </div>
            <div className="px-2">
              {user?.role !== "super_admin" && <OrgSwitcher />}
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4 py-2">
                {activeMode === "super_admin" ? "SUPER ADMIN" : activeMode === "admin" ? "ADMINISTRATION" : "MAIN MENU"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.url}
                        tooltip={item.title}
                        className="transition-all"
                      >
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-muted-foreground hover:text-foreground" 
              onClick={() => void logout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="font-bold">Mr DocGen</span>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
