"use client";

import { useState, useEffect } from "react";
import { Bell, Shield, UserCircle, Smartphone, Key, Monitor, History } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useRequireAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/http";
import { Organization } from "@/lib/schema";

export default function DashboardSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading } = useRequireAuth();
  const { toast } = useToast();
  const [currentOrgName, setCurrentOrgName] = useState("Loading...");

  const fetchOrgName = async () => {
    if (!user) return;
    try {
      const orgs = await apiRequest<Organization[]>("/api/user/organizations");
      // For super-admin, if they don't have a specific org linked, show 'Admin Panel' or similar
      if (user.role === "super_admin" && !user.organizationId) {
        setCurrentOrgName("Platform Super Admin");
        return;
      }
      
      const current = orgs.find((o: Organization) => String(o.id) === String(user.organizationId));
      setCurrentOrgName(current?.name || "No Organization");
    } catch (error) {
      console.error("Failed to fetch organization name in settings:", error);
      setCurrentOrgName("Error Loading Name");
    }
  };

  useEffect(() => {
    setMounted(true);
    if (user) fetchOrgName();
  }, [user]);

  if (!mounted || isLoading || !user) {
    return (
      <DashboardLayout>
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="space-y-6 max-w-4xl">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="mt-2 h-4 w-56" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="mt-2 h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <Skeleton className="h-10 w-36" />
              </CardContent>
            </Card>
        </div>
      </DashboardLayout>
    );
  }

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    toast({ title: "Settings saved", description: "Your profile has been updated." });
  };

  return (
    <DashboardLayout mode={user.role === "super_admin" ? "super_admin" : user.role === "admin" ? "admin" : "member"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account preferences and profile.</p>
      </div>

      <div className="space-y-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user.name} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user.email} className="bg-background" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Current Organization / Workspace</Label>
                  <Input 
                    id="company" 
                    key={currentOrgName}
                    defaultValue={currentOrgName} 
                    disabled 
                    className="bg-slate-50 font-medium text-slate-600 border-slate-200" 
                  />
                  <p className="text-[10px] text-muted-foreground italic">You can switch workspaces from the Organizations page.</p>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" className="rounded-xl px-8 font-bold">Update Profile</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Password
              </CardTitle>
              <CardDescription>Change your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-pwd">Current Password</Label>
                  <Input id="current-pwd" type="password" className="bg-background" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-pwd">New Password</Label>
                    <Input id="new-pwd" type="password" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pwd">Confirm Password</Label>
                    <Input id="confirm-pwd" type="password" className="bg-background" />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" variant="secondary" className="rounded-xl">Update Password</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Active Sessions
              </CardTitle>
              <CardDescription>Manage your logged-in browsers and devices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-2xl bg-white/50">
                <Monitor className="h-8 w-8 text-primary opacity-50" />
                <div className="flex-1">
                  <p className="font-bold">Current Browser Session</p>
                  <p className="text-xs text-muted-foreground">Your active connection on this device.</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 uppercase text-[10px]">active</Badge>
              </div>
            </CardContent>
          </Card>
      </div>
    </DashboardLayout>
  );
}
