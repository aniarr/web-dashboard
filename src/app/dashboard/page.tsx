"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, PlusCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/hooks/use-auth";
import { useReports } from "@/hooks/use-reports";
import { useActivity } from "@/hooks/use-activity";
import { Activity as ActivityIcon } from "lucide-react";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading: authLoading } = useRequireAuth();
  const { data: reports, isLoading: reportsLoading } = useReports();
  const { data: activity, isLoading: activityLoading } = useActivity();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || authLoading || !user) {
    return (
      <DashboardLayout>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-72" />
          </div>
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-2 h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="mb-4 h-6 w-32" />
        <Card>
          <div className="divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-muted-foreground">Here&apos;s what&apos;s happening with your reports today.</p>
        </div>
        <Link href="/dashboard/create">
          <Button className="gap-2 rounded-xl shadow-md transition-all hover:shadow-lg">
            <PlusCircle className="h-4 w-4" />
            New Report
          </Button>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reportsLoading ? "-" : reports?.length || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">Generated from your latest activity</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <h2 className="mb-4 text-xl font-bold">Recent Activity</h2>
      <Card className="overflow-hidden">
        <div className="divide-y">
          {activityLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </>
          ) : activity && activity.length > 0 ? (
            activity.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/40">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <ActivityIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{log.action.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</p>
                    <p className="max-w-[200px] truncate text-sm text-muted-foreground sm:max-w-md">{log.message}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mr-4">
                   {new Date(log.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <ActivityIcon className="mb-4 h-12 w-12 opacity-10" />
              <p className="text-sm font-medium">No recent activity found.</p>
              <p className="text-xs opacity-60">Generate a report to see your activity here.</p>
            </div>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}
