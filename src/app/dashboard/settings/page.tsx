"use client";

import { Bell, Shield, UserCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequireAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function DashboardSettingsPage() {
  const { user, isLoading } = useRequireAuth();
  const { toast } = useToast();

  if (isLoading || !user) {
    return <div className="p-8 text-muted-foreground">Loading settings...</div>;
  }

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    toast({ title: "Settings saved", description: "Your profile has been updated." });
  };

  return (
    <DashboardLayout isAdmin={user.role === "admin"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account preferences and profile.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="space-y-2">
          <Button variant="secondary" className="w-full justify-start bg-secondary/80 text-foreground">
            <UserCircle className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
        </div>

        <div className="space-y-6 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
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
                  <Label htmlFor="company">Company / Organization</Label>
                  <Input id="company" defaultValue="Acme Corp" className="bg-background" />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" className="rounded-xl">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
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
        </div>
      </div>
    </DashboardLayout>
  );
}
