"use client";

import { useMemo, useState, useEffect } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRequireAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useCreateManagedUser, useDeleteManagedUser, useSuperAdminOrganizations, useSuperAdminUsers, useUpdateManagedUser } from "@/hooks/use-super-admin";
import type { User } from "@/lib/schema";

export default function SuperAdminUsersPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading: authLoading } = useRequireAuth(false, true);
  const { toast } = useToast();
  const { data: users, isLoading } = useSuperAdminUsers();
  const { data: organizations } = useSuperAdminOrganizations();
  const createUser = useCreateManagedUser();
  const updateUser = useUpdateManagedUser();
  const deleteUser = useDeleteManagedUser();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
    organizationId: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredUsers = useMemo(() => {
    return (users ?? []).filter((managedUser) => {
      const matchesSearch =
        managedUser.name.toLowerCase().includes(search.toLowerCase()) ||
        managedUser.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || managedUser.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, search, users]);

  if (!mounted || authLoading || !user) {
    return (
      <DashboardLayout mode="super_admin">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_1.9fr]">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col gap-3 border-b p-4 md:flex-row">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full md:w-48" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const resetForm = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "member", organizationId: "" });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const isSuperAdmin = form.role === "super_admin";
      const organizationId = isSuperAdmin ? undefined : (form.organizationId || undefined);

      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser.id,
          data: {
            name: form.name,
            email: form.email,
            role: form.role as User["role"],
            organizationId,
            ...(form.password ? { password: form.password } : {}),
          },
        });
        toast({ title: "User updated", description: "The managed user was updated successfully." });
      } else {
        await createUser.mutateAsync({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role as User["role"],
          organizationId,
        });
        toast({ title: "User created", description: "A new managed user has been created." });
      }
      resetForm();
    } catch (error) {
      toast({ title: "Action failed", description: error instanceof Error ? error.message : "Unable to save user", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout mode="super_admin">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">Create, update, and remove member, admin, and super admin accounts.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_1.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? "Edit User" : "Create User"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="password">{editingUser ? "New Password" : "Password"}</Label>
                <Input id="password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required={!editingUser} />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select id="role" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="h-10 w-full rounded-md border px-3">
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                  <option value="super_admin">super_admin</option>
                </select>
              </div>
              <div>
                <Label htmlFor="organizationId">Organization</Label>
                <select
                  id="organizationId"
                  value={form.role === "super_admin" ? "" : form.organizationId}
                  onChange={(event) => setForm((current) => ({ ...current, organizationId: event.target.value }))}
                  disabled={form.role === "super_admin"}
                  className="h-10 w-full rounded-md border px-3 disabled:bg-muted disabled:opacity-70"
                >
                  <option value="">{form.role === "super_admin" ? "Not Required (Super Admin)" : "No organization"}</option>
                  {organizations?.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
                {form.role === "super_admin" && (
                  <p className="mt-1 text-[10px] text-muted-foreground italic">Super admins have global access and do not require organization assignment.</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  <UserPlus className="mr-2 h-4 w-4" />
                  {editingUser ? "Update User" : "Create User"}
                </Button>
                {editingUser && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b p-4 md:flex-row">
              <Input placeholder="Search by name or email..." value={search} onChange={(event) => setSearch(event.target.value)} />
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-10 rounded-md border px-3 md:w-48">
                <option value="all">all roles</option>
                <option value="member">member</option>
                <option value="admin">admin</option>
                <option value="super_admin">super_admin</option>
              </select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">User Info</TableHead>
                  <TableHead className="hidden sm:table-cell">Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Organization</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        <TableCell className="pl-6">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-40 sm:hidden" />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="pr-6"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : filteredUsers.map((managedUser) => (
                  <TableRow key={managedUser.id}>
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <span className="font-medium">{managedUser.name}</span>
                        <span className="text-xs text-muted-foreground sm:text-sm">{managedUser.email}</span>
                        <span className="mt-1 sm:hidden inline-flex w-fit rounded-full bg-secondary px-2 py-0.5 text-[10px]">{managedUser.role}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{managedUser.role}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {organizations?.find((organization) => organization.id === managedUser.organizationId)?.name ?? "-"}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingUser(managedUser);
                            setForm({
                              name: managedUser.name,
                              email: managedUser.email,
                              password: "",
                              role: managedUser.role,
                              organizationId: managedUser.organizationId ?? "",
                            });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={async () => {
                            try {
                              await deleteUser.mutateAsync(managedUser.id);
                              toast({ title: "User deleted", description: "The managed user was removed." });
                            } catch (error) {
                              toast({ title: "Delete failed", description: error instanceof Error ? error.message : "Unable to delete user", variant: "destructive" });
                            }
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
      </div>
    </DashboardLayout>
  );
}
