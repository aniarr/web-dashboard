"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, PlusCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/use-auth";
import { useReports } from "@/hooks/use-reports";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const { data: reports, isLoading } = useReports();

  if (authLoading || !user) {
    return <div className="p-8 text-muted-foreground">Loading dashboard...</div>;
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
              <div className="text-3xl font-bold">{isLoading ? "-" : reports?.length || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">Generated from your latest activity</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <h2 className="mb-4 text-xl font-bold">Recent Activity</h2>
      <Card className="overflow-hidden">
        <div className="divide-y">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading activity...</div>
          ) : reports && reports.length > 0 ? (
            reports.slice(0, 3).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/40">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{report.title}</p>
                    <p className="max-w-[200px] truncate text-sm text-muted-foreground sm:max-w-md">{report.details}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(report.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">No reports generated yet. Create your first one.</div>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}
