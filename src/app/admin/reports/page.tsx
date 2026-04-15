"use client";

import { Eye, FileText, Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminReports } from "@/hooks/use-admin";
import { useRequireAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function AdminReportsPage() {
  const { user, isLoading: authLoading } = useRequireAuth(true);
  const { data: reports, isLoading } = useAdminReports();
  const { toast } = useToast();

  if (authLoading || !user) {
    return <div className="p-8 text-muted-foreground">Loading reports...</div>;
  }

  return (
    <DashboardLayout isAdmin>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Reports</h1>
          <p className="mt-1 text-muted-foreground">System-wide log of generated documents.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search titles..." className="pl-9 bg-background" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead className="pl-6 py-4">Title</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Excerpt</TableHead>
                <TableHead className="pr-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Loading reports...</TableCell>
                </TableRow>
              ) : reports?.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/30">
                  <TableCell className="flex items-center gap-2 pl-6 py-4 font-medium">
                    <FileText className="h-4 w-4 text-primary" /> {report.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">User #{report.userId}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{report.details}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button variant="ghost" size="sm" onClick={() => toast({ title: "View Document", description: "Report details modal would open." })}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
