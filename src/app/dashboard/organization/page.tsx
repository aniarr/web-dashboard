"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, PlusCircle, Check, ArrowRight, Loader2, Users, MapPin, Globe, History, FileText } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/http";
import type { Organization } from "@/lib/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function OrganizationPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCancelCreate, setShowCancelCreate] = useState(false);
  const [stats, setStats] = useState<{ memberCount: number; reportCount: number } | null>(null);

  const fetchOrgs = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<Organization[]>("/api/user/organizations", { method: "GET" });
      setOrganizations(data);
      
      // Fetch stats for the current organization if it exists
      const current = data.find(o => o.id === user?.organizationId);
      if (current) {
        const statsData = await apiRequest<{ memberCount: number; reportCount: number }>(`/api/organizations/${current.id}/stats`);
        setStats(statsData);
      }
    } catch (error) {
      console.error("Failed to fetch organizations or stats", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrgs();
  }, [user]);

  const currentOrg = organizations.find((org) => org.id === user?.organizationId);

  const handleSwitch = async (orgId: string) => {
    if (orgId === user?.organizationId) return;
    
    setIsSwitching(orgId);
    try {
      await apiRequest("/api/user/switch-organization", {
        method: "POST",
        body: JSON.stringify({ organizationId: orgId }),
      });
      await refreshUser();
      toast({ title: "Workspace Switched", description: "Loading your new environment..." });
      window.location.reload();
    } catch (error) {
      toast({ title: "Switch Failed", description: "Failed to switch organization.", variant: "destructive" });
    } finally {
      setIsSwitching(null);
    }
  };

  const handleCreateOrg = async () => {
    if (!newOrgName) return;
    setIsCreating(true);
    try {
      await apiRequest("/api/organizations/create", {
        method: "POST",
        body: JSON.stringify({ name: newOrgName }),
      });
      await refreshUser();
      toast({ title: "Organization Created", description: "Your new workspace is ready." });
      setShowCreateDialog(false);
      window.location.reload();
    } catch (error) {
      toast({ title: "Creation Failed", description: "Failed to create organization.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Your Workspaces</h1>
            <p className="text-slate-500 text-lg">Manage your currently active organization or switch to another team.</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="rounded-full h-14 px-8 bg-slate-900 hover:bg-slate-800 font-bold shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Create Organization
          </Button>
        </div>

        {/* Current Organization Highlight */}
        {currentOrg ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <Card className="relative border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Building2 className="h-40 w-40" />
              </div>
              <CardHeader className="p-8 md:p-12 pb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-4 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
                    Current Active
                  </Badge>
                </div>
                <CardTitle className="text-4xl md:text-5xl font-black text-slate-900">{currentOrg.name}</CardTitle>
                <CardDescription className="text-xl text-slate-500 mt-2 max-w-2xl">
                  {currentOrg.description || "No description provided for this organization."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 md:p-12 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                       <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <History className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Joined Date</p>
                          <p className="font-bold text-slate-700">{new Date(currentOrg.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>

                    {user?.role === "admin" || user?.role === "super_admin" ? (
                      <Link href="/admin/members" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all cursor-pointer group/card">
                        <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 group-hover/card:scale-110 transition-transform">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Team Members</p>
                            <p className="font-bold text-slate-700">{stats?.memberCount ?? '-'}</p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Team Members</p>
                            <p className="font-bold text-slate-700">{stats?.memberCount ?? '-'}</p>
                        </div>
                      </div>
                    )}

                    <Link href="/admin/reports" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all cursor-pointer group/card">
                      <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover/card:scale-110 transition-transform">
                          <FileText className="h-6 w-6" />
                      </div>
                      <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Reports Generated</p>
                          <p className="font-bold text-slate-700">{stats?.reportCount ?? '-'}</p>
                      </div>
                    </Link>
                    

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                       <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <MapPin className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Subscription</p>
                          <p className="font-bold text-slate-700 capitalize">{(currentOrg as any).plan || 'Starter'}</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center bg-slate-50/50">
            <Building2 className="h-20 w-20 mx-auto text-slate-300 mb-6" />
            <h2 className="text-3xl font-bold text-slate-800">You're not in an organization</h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto text-lg">
              You need to join or create an organization to start generating and managing documents.
            </p>
            <Button 
                onClick={() => setShowCreateDialog(true)}
                className="mt-8 rounded-full h-14 px-10 bg-primary font-bold shadow-lg"
            >
                Create Your First Organization
            </Button>
          </Card>
        )}

        {/* Other Organizations List */}
        {organizations.length > 1 || (organizations.length > 0 && !currentOrg) ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 px-2">Other Available Workspaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {organizations
                .filter(org => org.id !== currentOrg?.id)
                .map((org, index) => (
                  <motion.div 
                    key={org.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all rounded-3xl overflow-hidden group">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                            <Building2 className="h-7 w-7" />
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-bold text-slate-900 text-lg truncate">{org.name}</h3>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                               <p className="truncate">{org.slug || 'no-slug'}</p>
                               {((org as any).memberCount !== undefined) && (
                                 <>
                                   <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                   <p className="shrink-0">{(org as any).memberCount} members</p>
                                   <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                   <p className="shrink-0">{(org as any).reportCount} reports</p>
                                 </>
                               )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleSwitch(org.id)}
                          disabled={!!isSwitching}
                          variant="ghost" 
                          className="rounded-full hover:bg-primary/10 hover:text-primary font-bold px-6"
                        >
                          {isSwitching === org.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              Switch <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        ) : currentOrg && (
            <div className="text-center py-12 px-6 rounded-[2.5rem] bg-slate-50 border border-slate-100">
                <p className="text-slate-500">You don't have any other organizations yet. Create a new one to manage different teams.</p>
            </div>
        )}

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          if (!open) {
            if (newOrgName) setShowCancelCreate(true);
            else setShowCreateDialog(false);
          }
        }}>
          <DialogContent className="rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Create New Organization</DialogTitle>
              <DialogDescription className="text-lg">
                Build a fresh workspace for your team, department, or specialized project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-8">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Organization Name</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Inovus Tech" 
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 focus:ring-primary text-lg"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => {
                if (newOrgName) setShowCancelCreate(true);
                else setShowCreateDialog(false);
              }} className="rounded-full h-12 px-8 font-semibold">Cancel</Button>
              <Button 
                onClick={handleCreateOrg} 
                disabled={isCreating || !newOrgName} 
                className="rounded-full h-12 px-10 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xl transition-all active:scale-95"
              >
                {isCreating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
                Create Workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showCancelCreate} onOpenChange={setShowCancelCreate}>
          <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">Discard organization?</AlertDialogTitle>
              <AlertDialogDescription>
                You have entered an organization name. If you cancel now, your input will be cleared.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="rounded-full">Continue Creating</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  setNewOrgName("");
                  setShowCancelCreate(false);
                  setShowCreateDialog(false);
                }} 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full px-6"
              >
                Discard & Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
