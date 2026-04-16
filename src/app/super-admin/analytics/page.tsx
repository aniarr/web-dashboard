"use client";

import { useState, useEffect } from "react";
import { BarChart3, Building2, FileText, ShieldCheck, Users } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/hooks/use-auth";
import { useSuperAdminAnalytics, useSuperAdminStats } from "@/hooks/use-super-admin";

export default function SuperAdminAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading: authLoading } = useRequireAuth(false, true);
  const { data: stats, isLoading } = useSuperAdminStats();
  const { data: analyticsData, isLoading: loadingAnalytics } = useSuperAdminAnalytics();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || authLoading || !user) {
    return (
      <DashboardLayout mode="super_admin">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="h-[320px]">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent className="h-[320px]">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
        <Card className="mt-8">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="h-[360px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const summaryCards = [
    { label: "Members", value: stats?.totalMembers ?? "-", icon: Users },
    { label: "Admins", value: stats?.totalAdmins ?? "-", icon: ShieldCheck },
    { label: "Super Admins", value: stats?.totalSuperAdmins ?? "-", icon: ShieldCheck },
    { label: "Organizations", value: stats?.totalOrganizations ?? "-", icon: Building2 },
    { label: "Active Organizations", value: stats?.activeOrganizations ?? "-", icon: Building2 },
    { label: "Reports", value: stats?.totalReports ?? "-", icon: FileText },
  ];

  return (
    <DashboardLayout mode="super_admin">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">A high-level operational snapshot of the complete platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((item) => (
          <Card key={item.label} className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              <item.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "-" : item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Role Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loadingAnalytics ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analyticsData?.roleBreakdown ?? []} dataKey="value" nameKey="name" outerRadius={110} label>
                    {(analyticsData?.roleBreakdown ?? []).map((entry, index) => (
                      <Cell key={entry.name} fill={["#1f3a5f", "#4f83cc", "#90a4ce"][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loadingAnalytics ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analyticsData?.organizationStatus ?? []} dataKey="value" nameKey="name" outerRadius={110} label>
                    {(analyticsData?.organizationStatus ?? []).map((entry, index) => (
                      <Cell key={entry.name} fill={["#0f766e", "#dc2626"][index % 2]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Reports Timeline</CardTitle>
        </CardHeader>
        <CardContent className="h-[360px]">
          {loadingAnalytics ? (
            <div className="flex h-full items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.reportsTimeline ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="reports" stroke="#1f3a5f" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
