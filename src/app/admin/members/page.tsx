"use client";

import { useMemo, useState, useEffect } from "react";
import { MoreHorizontal, Search, UserPlus, Pencil, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminMembers, useCreateAdminMember, useDeleteAdminMember, useUpdateAdminMember } from "@/hooks/use-admin";
import { useRequireAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/schema";

export default function MembersPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading: authLoading } = useRequireAuth(true);
  const { data: members, isLoading } = useAdminMembers();
  const { toast } = useToast();
  
  const createMember = useCreateAdminMember();
  const updateMember = useUpdateAdminMember();
  const deleteMember = useDeleteAdminMember();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredMembers = useMemo(() => {
    return (members ?? []).filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [members, search]);

  if (!mounted || authLoading || !user) {
    return (
      <DashboardLayout mode="admin">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="flex w-full items-center gap-4 md:w-auto">
            <Skeleton className="h-10 w-full md:w-64 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-xl" />
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
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const resetForm = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "member" });
    setIsDialogOpen(false);
    setShowCancelDialog(false);
  };

  const handleCancelClick = () => {
    const isDirty = form.name || form.email || form.password;
    if (isDirty) {
      setShowCancelDialog(true);
    } else {
      resetForm();
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingUser) {
        await updateMember.mutateAsync({
          id: editingUser.id,
          data: {
            name: form.name,
            email: form.email,
            role: form.role as User["role"],
            ...(form.password ? { password: form.password } : {}),
          },
        });
        toast({ title: "Member updated", description: "The member details were updated successfully." });
      } else {
        await createMember.mutateAsync({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role as User["role"],
        });
        toast({ title: "Member created", description: "A new member has been added to your organization." });
      }
      resetForm();
    } catch (error) {
      toast({ title: "Action failed", description: error instanceof Error ? error.message : "Unable to save member", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout mode="admin">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Members</h1>
          <p className="mt-1 text-muted-foreground">Manage users, roles, and access.</p>
        </div>
        <div className="flex w-full items-center gap-4 md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-background" />
          </div>
          <Button className="shrink-0 rounded-xl shadow-md" onClick={() => { setEditingUser(null); setIsDialogOpen(true); }}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) handleCancelClick();
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit Member" : "Add New Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((curr) => ({ ...curr, name: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm((curr) => ({ ...curr, email: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="password">{editingUser ? "New Password (optional)" : "Password"}</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => setForm((curr) => ({ ...curr, password: e.target.value }))} required={!editingUser} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select id="role" value={form.role} onChange={(e) => setForm((curr) => ({ ...curr, role: e.target.value }))} className="h-10 w-full rounded-md border px-3 mt-1">
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button type="button" variant="outline" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button type="submit">
                {editingUser ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved information in this form. If you close now, your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full">Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={resetForm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full px-6">
              Discard & Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{userToDelete?.name}</strong> from the organization. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (!userToDelete) return;
                try {
                  await deleteMember.mutateAsync(userToDelete.id);
                  toast({ title: "Member deleted", description: "The member was removed." });
                } catch (error) {
                  toast({ title: "Delete failed", description: error instanceof Error ? error.message : "Unable to delete member", variant: "destructive" });
                } finally {
                  setUserToDelete(null);
                  setShowDeleteDialog(false);
                }
              }} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full px-6"
            >
              Delete Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : filteredMembers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium">
                    No members found matching your search.
                  </TableCell>
                </TableRow>
              ) : filteredMembers?.map((member) => (
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
                    <div className="flex justify-end gap-2">
                       <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingUser(member);
                            setForm({
                              name: member.name,
                              email: member.email,
                              password: "",
                              role: member.role,
                            });
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                         <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setUserToDelete(member);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
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
