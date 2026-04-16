"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useAuditLogs, useSiteSettings, useUpdateSiteSettings } from "@/hooks/use-super-admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { SiteSettings } from "@/lib/schema";

export default function SuperAdminSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading } = useRequireAuth(false, true);
  const { toast } = useToast();
  const { data: settings, isLoading: loadingSettings } = useSiteSettings();
  const { data: logs, isLoading: loadingLogs } = useAuditLogs(50);
  const updateSettings = useUpdateSiteSettings();
  const [form, setForm] = useState<
    Pick<
      SiteSettings,
      | "platformName"
      | "supportEmail"
      | "defaultOrganizationName"
      | "maintenanceMode"
      | "maintenanceMessage"
      | "allowPublicSignup"
      | "defaultUserRole"
      | "requireOrganizationForUsers"
    >
  >({
    platformName: "",
    supportEmail: "",
    defaultOrganizationName: "",
    maintenanceMode: false,
    maintenanceMessage: "The platform is currently in maintenance mode.",
    allowPublicSignup: true,
    defaultUserRole: "member",
    requireOrganizationForUsers: false,
  });

  useEffect(() => {
    setMounted(true);
    if (settings) {
      setForm({
        platformName: settings.platformName,
        supportEmail: settings.supportEmail,
        defaultOrganizationName: settings.defaultOrganizationName,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage ?? "The platform is currently in maintenance mode.",
        allowPublicSignup: settings.allowPublicSignup,
        defaultUserRole: settings.defaultUserRole,
        requireOrganizationForUsers: settings.requireOrganizationForUsers,
      });
    }
  }, [settings]);

  if (!mounted || isLoading || !user) {
    return (
      <DashboardLayout mode="super_admin">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-44" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-11" />
                </div>
              ))}
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout mode="super_admin">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Super Admin Settings</h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">Reserved for global site settings and platform-wide configuration.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Platform Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSettings ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-11" />
                  </div>
                ))}
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
              <form
                className="space-y-6"
                onSubmit={async (event) => {
                  event.preventDefault();
                  try {
                    await updateSettings.mutateAsync(form);
                    toast({ title: "Settings saved", description: "Platform configuration has been updated." });
                  } catch (error) {
                    toast({
                      title: "Save failed",
                      description: error instanceof Error ? error.message : "Unable to save settings",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="platformName">Platform name</Label>
                    <Input
                      id="platformName"
                      value={form.platformName}
                      onChange={(event) => setForm((current) => ({ ...current, platformName: event.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportEmail">Support email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={form.supportEmail}
                      onChange={(event) => setForm((current) => ({ ...current, supportEmail: event.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="defaultOrganizationName">Default organization name</Label>
                  <Input
                    id="defaultOrganizationName"
                    value={form.defaultOrganizationName}
                    onChange={(event) => setForm((current) => ({ ...current, defaultOrganizationName: event.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultUserRole">Default signup role</Label>
                  <select
                    id="defaultUserRole"
                    value={form.defaultUserRole}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        defaultUserRole: event.target.value as SiteSettings["defaultUserRole"],
                      }))
                    }
                    className="h-10 w-full rounded-md border px-3"
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                    <option value="super_admin">super_admin</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Maintenance mode</p>
                      <p className="text-sm text-muted-foreground">Temporarily block login while platform maintenance is active.</p>
                    </div>
                    <Switch checked={form.maintenanceMode} onCheckedChange={(checked) => setForm((current) => ({ ...current, maintenanceMode: checked }))} />
                  </div>
                  {form.maintenanceMode && (
                    <div className="rounded-lg border p-4">
                      <Label htmlFor="maintenanceMessage" className="font-medium">Maintenance message</Label>
                      <p className="mb-2 text-sm text-muted-foreground">Custom message shown to users during maintenance.</p>
                      <Input
                        id="maintenanceMessage"
                        value={form.maintenanceMessage}
                        onChange={(event) => setForm((current) => ({ ...current, maintenanceMessage: event.target.value }))}
                        placeholder="The platform is currently in maintenance mode."
                      />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4">
                    <div>
                      <p className="font-medium">Allow public signup</p>
                      <p className="text-sm text-muted-foreground">Control whether users can self-register.</p>
                    </div>
                    <Switch checked={form.allowPublicSignup} onCheckedChange={(checked) => setForm((current) => ({ ...current, allowPublicSignup: checked }))} />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4">
                    <div>
                      <p className="font-medium">Require organization for users</p>
                      <p className="text-sm text-muted-foreground">Force new users to be created only with organization assignment.</p>
                    </div>
                    <Switch
                      checked={form.requireOrganizationForUsers}
                      onCheckedChange={(checked) => setForm((current) => ({ ...current, requireOrganizationForUsers: checked }))}
                    />
                  </div>
                </div>
                <Button type="submit">Save Settings</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingLogs ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              logs?.map((log) => (
                <div key={log.id} className="border-b pb-3 last:border-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="font-medium break-words">{log.message}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground break-words">
                    {log.action} | {log.entityType} | {log.actorEmail ?? "system"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
