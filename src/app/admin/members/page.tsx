"use client";

import { MoreHorizontal, Search, UserPlus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminMembers } from "@/hooks/use-admin";
import { useRequireAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function MembersPage() {
  const { user, isLoading: authLoading } = useRequireAuth(true);
  const { data: members, isLoading } = useAdminMembers();
  const { toast } = useToast();

  if (authLoading || !user) {
    return <div className="p-8 text-muted-foreground">Loading members...</div>;
  }

  return (
    <DashboardLayout isAdmin>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Members</h1>
          <p className="mt-1 text-muted-foreground">Manage users, roles, and access.</p>
        </div>
        <div className="flex w-full items-center gap-4 md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search members..." className="pl-9 bg-background" />
          </div>
          <Button className="shrink-0 rounded-xl shadow-md" onClick={() => toast({ title: "Action mock", description: "Add member dialog would open here." })}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead className="pl-6 py-4">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Loading members...</TableCell>
                </TableRow>
              ) : members?.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/30">
                  <TableCell className="pl-6 py-4 font-medium">{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${member.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                      {member.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-green-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
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
