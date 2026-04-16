"use client";

import { useState, useEffect } from "react";
import { Building2, Pencil, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRequireAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useCreateOrganization, useDeleteOrganization, useSuperAdminOrganizations, useUpdateOrganization } from "@/hooks/use-super-admin";
import type { Organization } from "@/lib/schema";

export default function SuperAdminOrganizationsPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading: authLoading } = useRequireAuth(false, true);
  const { toast } = useToast();
  const { data: organizations, isLoading } = useSuperAdminOrganizations();
  const createOrganization = useCreateOrganization();
  const updateOrganization = useUpdateOrganization();
  const deleteOrganization = useDeleteOrganization();
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", isActive: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || authLoading || !user) {
    return (
      <DashboardLayout mode="super_admin">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_1.9fr]">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
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
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
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
    setEditingOrganization(null);
    setForm({ name: "", slug: "", description: "", isActive: true });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingOrganization) {
        await updateOrganization.mutateAsync({ id: editingOrganization.id, data: form });
        toast({ title: "Organization updated", description: "The organization was updated successfully." });
      } else {
        await createOrganization.mutateAsync(form);
        toast({ title: "Organization created", description: "A new organization has been created." });
      }
      resetForm();
    } catch (error) {
      toast({ title: "Action failed", description: error instanceof Error ? error.message : "Unable to save organization", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout mode="super_admin">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manage Organizations</h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">Create and control the organizations that structure your platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_1.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingOrganization ? "Edit Organization" : "Create Organization"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </div>
              <div>
                <Label htmlFor="isActive">Status</Label>
                <select id="isActive" value={String(form.isActive)} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === "true" }))} className="h-10 w-full rounded-md border px-3">
                  <option value="true">active</option>
                  <option value="false">inactive</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  <Building2 className="mr-2 h-4 w-4" />
                  {editingOrganization ? "Update Organization" : "Create Organization"}
                </Button>
                {editingOrganization && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Organizations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Organization</TableHead>
                  <TableHead className="hidden sm:table-cell">Slug</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Description</TableHead>
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
                          <Skeleton className="h-3 w-20 sm:hidden" />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell className="pr-6"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : organizations?.map((organization) => (
                  <TableRow key={organization.id}>
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <span className="font-medium">{organization.name}</span>
                        <span className="text-xs text-muted-foreground sm:hidden">{organization.slug}</span>
                        <div className="mt-1 flex gap-2 sm:hidden">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] ${organization.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {organization.isActive ? "active" : "inactive"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{organization.slug}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className={`rounded-full px-2 py-1 text-xs ${organization.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {organization.isActive ? "active" : "inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[280px] truncate">{organization.description || "-"}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingOrganization(organization);
                            setForm({
                              name: organization.name,
                              slug: organization.slug,
                              description: organization.description || "",
                              isActive: organization.isActive ?? true,
                            });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            try {
                              await deleteOrganization.mutateAsync(organization.id);
                              toast({ title: "Organization deleted", description: "The organization was removed." });
                            } catch (error) {
                              toast({ title: "Delete failed", description: error instanceof Error ? error.message : "Unable to delete organization", variant: "destructive" });
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
