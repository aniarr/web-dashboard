"use client";

import { useState, useEffect } from "react";
import { Activity, BarChart3, Building2, ShieldCheck, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/hooks/use-auth";
import { useSuperAdminOrganizations, useSuperAdminStats, useSuperAdminUsers } from "@/hooks/use-super-admin";

export default function SuperAdminOverviewPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading: authLoading } = useRequireAuth(false, true);
  const { data: stats, isLoading: loadingStats } = useSuperAdminStats();
  const { data: users } = useSuperAdminUsers();
  const { data: organizations } = useSuperAdminOrganizations();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || authLoading || !user) {
    return (
      <DashboardLayout mode="super_admin">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers ?? "-", icon: Users },
    { title: "Organizations", value: stats?.totalOrganizations ?? "-", icon: Building2 },
    { title: "Reports", value: stats?.totalReports ?? "-", icon: BarChart3 },
    { title: "Super Admins", value: stats?.totalSuperAdmins ?? "-", icon: ShieldCheck },
  ];

  return (
    <DashboardLayout mode="super_admin">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Super Admin Control Center</h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">Manage the full platform: users, organizations, analytics, and system-level access.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <Card key={item.title} className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
              <item.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loadingStats ? "-" : item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {users && users.length > 0 ? (
              users.slice(0, 5).map((managedUser) => (
                <div key={managedUser.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-0 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {managedUser.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{managedUser.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{managedUser.email}</p>
                    </div>
                  </div>
                  <span className="w-fit rounded-full bg-secondary px-2 py-1 text-xs">{managedUser.role}</span>
                </div>
              ))
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                <Users className="h-8 w-8 opacity-20" />
                <p className="text-sm font-medium">No users registered yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {organizations && organizations.length > 0 ? (
              organizations.slice(0, 5).map((organization) => (
                <div key={organization.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-0 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{organization.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{organization.slug}</p>
                    </div>
                  </div>
                  <span className={`w-fit rounded-full px-2 py-1 text-xs ${organization.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {organization.isActive ? "active" : "inactive"}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                <Building2 className="h-8 w-8 opacity-20" />
                <p className="text-sm font-medium">No organizations found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
