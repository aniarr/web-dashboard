"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, PlusCircle, ArrowLeft, Loader2, Sparkles, Layout } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/http";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function CreateOrganizationSetupPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    
    const pendingPlan = typeof window !== "undefined" ? sessionStorage.getItem("pendingPlan") : "starter";
    
    setIsCreating(true);
    try {
      await apiRequest("/api/organizations/create", {
        method: "POST",
        body: JSON.stringify({ ...form, plan: pendingPlan }),
      });
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pendingPlan");
      }
      await refreshUser();
      toast({ title: "Workspace Ready", description: "Your organization has been successfully created." });
      
      // Redirect to dashboard now that they have an org
      router.push("/dashboard");
    } catch (error: any) {
      let errorMessage = "Could not create organization. Please try again.";
      
      try {
        if (error instanceof Error) {
          const parsed = JSON.parse(error.message);
          errorMessage = parsed.message || errorMessage;
        }
      } catch (e) {
        errorMessage = error.message || errorMessage;
      }

      toast({ 
        title: "Setup Failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-12 max-w-2xl"
      >
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
          Step 2: Workspace Setup
        </Badge>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tell us about your organization</h1>
        <p className="text-lg text-slate-500">This will be shared across your team members and branded on your documents.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="p-10 pb-0">
             <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full -ml-4">
                   <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                   <Building2 className="h-6 w-6" />
                </div>
             </div>
             <CardTitle className="text-3xl font-bold">New Workspace</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-8">
            <form onSubmit={handleCreateOrg} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Organization Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Innovation Hub" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="h-14 rounded-2xl border-slate-200 focus:ring-primary text-lg"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Short Bio</Label>
                <Textarea 
                  id="description" 
                  placeholder="Briefly describe what your organization does..." 
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-primary"
                />
              </div>

              <div className="pt-4">
                <Button 
                    type="submit"
                    disabled={isCreating || !form.name} 
                    className="w-full h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-95"
                >
                    {isCreating ? (
                        <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Finalizing Setup...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Finish & Launch Dashboard
                        </>
                    )}
                </Button>
              </div>
            </form>
          </CardContent>
          <div className="bg-slate-50 p-6 flex items-center gap-3 justify-center">
             <Layout className="h-4 w-4 text-slate-400" />
             <p className="text-xs text-slate-500 font-medium italic">You can customize branding images later in settings.</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
