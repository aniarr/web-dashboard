"use client";

import { motion } from "framer-motion";
import { Activity, FileText, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminMembers, useAdminReports } from "@/hooks/use-admin";
import { useRequireAuth } from "@/hooks/use-auth";

export default function AdminPage() {
  const { user, isLoading: authLoading } = useRequireAuth(true);
  const { data: members, isLoading: loadingMembers } = useAdminMembers();
  const { data: reports, isLoading: loadingReports } = useAdminReports();

  if (authLoading || !user) {
    return <div className="p-8 text-muted-foreground">Loading admin overview...</div>;
  }

  return (
    <DashboardLayout isAdmin>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="mt-1 text-muted-foreground">System status and platform analytics.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loadingMembers ? "-" : members?.length || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Generated Reports</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loadingReports ? "-" : reports?.length || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">Across all users</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="hover-elevate border-primary bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">System Status</CardTitle>
              <Activity className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">100%</div>
              <p className="mt-1 text-xs text-primary-foreground/80">Operational & Healthy</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingMembers ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : members?.slice(0, 4).map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-secondary px-2 py-1 text-xs">{member.role}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingReports ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : reports?.slice(0, 4).map((report) => (
                <div key={report.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">{report.title}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>By User #{report.userId}</span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
