"use client";

import { useState, useEffect } from "react";
import { 
  Check, 
  ChevronsUpDown, 
  PlusCircle, 
  Building2, 
  Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

export function OrgSwitcher() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    const fetchOrgs = async () => {
      setIsLoading(true);
      try {
        const data = await apiRequest<Organization[]>("/api/user/organizations", { method: "GET" });
        setOrganizations(data);
      } catch (error) {
        console.error("Failed to fetch organizations", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchOrgs();
  }, [user]);

  const currentOrg = organizations.find((org) => org.id === user?.organizationId);

  const onSelect = async (orgId: string) => {
    if (orgId === user?.organizationId) {
        setOpen(false);
        return;
    }
    
    setIsSwitching(true);
    setOpen(false);
    try {
      await apiRequest("/api/user/switch-organization", {
        method: "POST",
        body: JSON.stringify({ organizationId: orgId }),
      });
      await refreshUser();
      toast({ title: "Organization Switched", description: "Your workspace has been updated." });
      window.location.reload(); 
    } catch (error) {
      toast({ title: "Switch Failed", description: "Failed to switch organization.", variant: "destructive" });
    } finally {
      setIsSwitching(false);
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
      toast({ title: "Organization Created", description: "Your new organization is ready." });
      setShowCreateDialog(false);
      window.location.reload();
    } catch (error) {
      toast({ title: "Creation Failed", description: "Failed to create organization.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select organization"
            className="w-full justify-between overflow-hidden text-ellipsis whitespace-nowrap bg-background/50 hover:bg-background/80 transition-colors border-border/50 h-11 px-3 rounded-xl border"
          >
            <div className="flex items-center gap-2 overflow-hidden">
               <Building2 className="mr-2 h-4 w-4 shrink-0 opacity-50 text-primary" />
               <span className="truncate font-medium">
                 {currentOrg?.name || (isLoading ? "Loading..." : "Select Organization")}
               </span>
            </div>
            {isSwitching ? (
              <Loader2 className="ml-auto h-4 w-4 shrink-0 animate-spin opacity-50" />
            ) : (
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0 rounded-2xl shadow-2xl border-border/50" align="start">
          <Command className="rounded-2xl">
            <CommandList>
              <CommandInput placeholder="Search organization..." />
              <CommandEmpty>No organization found.</CommandEmpty>
              <CommandGroup heading="Your Workspaces">
                {organizations.map((org) => (
                  <CommandItem
                    key={org.id}
                    onSelect={() => onSelect(org.id)}
                    className="flex items-center justify-between py-3 px-4 rounded-lg cursor-pointer mx-1"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="truncate font-medium">{org.name}</span>
                    </div>
                    {user?.organizationId === org.id && (
                       <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandItem
                onSelect={() => {
                    setOpen(false);
                    setShowCreateDialog(true);
                }}
                className="flex items-center gap-2 py-3 px-5 cursor-pointer text-primary hover:text-primary transition-colors font-semibold"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Create New Organization</span>
              </CommandItem>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <DialogContent className="rounded-[2rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">New Organization</DialogTitle>
          <DialogDescription className="text-base">
            Create a separate workspace for your new department or project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Organization Name</Label>
            <Input 
                id="name" 
                placeholder="e.g. Science Club" 
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="h-14 rounded-2xl border-slate-200 focus:ring-primary text-lg"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setShowCreateDialog(false)} className="rounded-full h-12 px-6">Cancel</Button>
          <Button onClick={handleCreateOrg} disabled={isCreating || !newOrgName} className="rounded-full h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95">
            {isCreating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
            Create Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
