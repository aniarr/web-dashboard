"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Loader2, Building2, Layout, FileText, BadgeCheck, Upload, Trash2, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRequireAuth } from "@/hooks/use-auth";
import { useAdminOrganization, useUpdateAdminOrganization } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
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

export default function AdminSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading: authLoading } = useRequireAuth(true);
  const { data: organization, isLoading: orgLoading, refetch } = useAdminOrganization();
  const updateOrg = useUpdateAdminOrganization();
  const { toast } = useToast();
  
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [uploadingFooter, setUploadingFooter] = useState(false);
  
  const headerFileRef = useRef<HTMLInputElement>(null);
  const footerFileRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [footerFile, setFooterFile] = useState<File | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [footerPreview, setFooterPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    headerTitle: "",
    headerSubtitle: "",
    footerText: "",
    description: "",
    signatureLeftLabel: "",
    signatureRightLabel: "",
    signatureRightName: "",
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (organization) {
      setForm({
        name: organization.name || "",
        headerTitle: organization.headerTitle || "",
        headerSubtitle: organization.headerSubtitle || "",
        footerText: organization.footerText || "",
        description: organization.description || "",
        signatureLeftLabel: organization.signatureLeftLabel || "Event Coordinator",
        signatureRightLabel: organization.signatureRightLabel || "Head of Department",
        signatureRightName: organization.signatureRightName || "",
      });
      setIsDirty(false);
      setHeaderPreview(null);
      setFooterPreview(null);
      setHeaderFile(null);
      setFooterFile(null);
    }
  }, [organization]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handleInternalNavigation = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link && isDirty) {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
          e.preventDefault();
          e.stopPropagation();
          setPendingUrl(href);
          setShowLeaveDialog(true);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleInternalNavigation, true);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleInternalNavigation, true);
    };
  }, [isDirty]);

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUploadingHeader(headerFile !== null);
    setUploadingFooter(footerFile !== null);
    
    try {
      // 1. Upload files if present
      if (headerFile) {
        const formData = new FormData();
        formData.append("file", headerFile);
        formData.append("type", "header");
        await fetch("/api/admin/organization/upload", { method: "POST", body: formData });
      }
      
      if (footerFile) {
        const formData = new FormData();
        formData.append("file", footerFile);
        formData.append("type", "footer");
        await fetch("/api/admin/organization/upload", { method: "POST", body: formData });
      }

      // 2. Save other settings
      await updateOrg.mutateAsync(form);
      setIsDirty(false);
      setHeaderFile(null);
      setFooterFile(null);
      setHeaderPreview(null);
      setFooterPreview(null);
      
      toast({ title: "Settings updated", description: "Organization branding and details have been saved.", variant: "success" });
      refetch();
    } catch (error) {
      toast({ title: "Update failed", description: "Failed to save organization settings.", variant: "destructive" });
    } finally {
      setUploadingHeader(false);
      setUploadingFooter(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "header" | "footer") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (type === "header") {
      setHeaderFile(file);
      setHeaderPreview(previewUrl);
    } else {
      setFooterFile(file);
      setFooterPreview(previewUrl);
    }
    setIsDirty(true);
  };

  const removeImage = async (type: "header" | "footer") => {
    try {
      const res = await fetch("/api/admin/organization/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) throw new Error("Delete failed");
      
      toast({ title: "Image removed", description: `${type} branding has been cleared.`, variant: "success" });
      refetch();
    } catch (error) {
      toast({ title: "Action failed", description: "Could not remove image.", variant: "destructive" });
    }
  };

  if (!mounted || authLoading || orgLoading || !user) {
    return (
      <DashboardLayout mode="admin">
        <div className="max-w-4xl mx-auto py-10 space-y-6">
          <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout mode="admin">
      <div className="max-w-5xl mx-auto pb-20 relative">
        <div className="sticky top-0 z-30 mb-8 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-md border-b flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Organization Settings</h1>
            {isDirty && (
              <p className="text-xs font-bold text-amber-600 flex items-center gap-1 mt-1">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                You have unsaved changes
              </p>
            )}
          </div>
          <Button 
            onClick={() => handleSubmit()}
            disabled={!isDirty || updateOrg.isPending}
            className={`h-12 px-6 rounded-full font-bold shadow-lg transition-all active:scale-95 flex gap-2 ${
              isDirty ? "bg-primary hover:bg-primary/90 text-white" : "bg-slate-100 text-slate-400"
            }`}
          >
            {updateOrg.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  General Info
                </h2>
                <p className="text-sm text-slate-500">Basic identification for your organization in the system.</p>
              </div>
              
              <Card className="md:col-span-2 border-none shadow-xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-bold">Organization Name</Label>
                    <Input 
                      id="name" 
                      value={form.name} 
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="e.g. Inovus Labs IEDC"
                      className="h-14 rounded-2xl border-slate-200 focus:ring-primary text-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-700 font-bold">Short Description</Label>
                    <Textarea 
                      id="description" 
                      value={form.description} 
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Briefly describe your organization..."
                      className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-primary"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>

          <hr className="border-slate-200" />

          {/* Document Branding Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Document Branding
              </h2>
              <p className="text-sm text-slate-500">Cloudinary-powered image assets for official document letterheads and seals.</p>
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-400" />
                    Custom Header Layout
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold">Header Title</Label>
                      <Input 
                        value={form.headerTitle} 
                        onChange={(e) => updateField("headerTitle", e.target.value)}
                        className="rounded-xl border-slate-200"
                        placeholder="e.g. COLLEGE OF ENG"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold">Header Subtitle</Label>
                      <Input 
                        value={form.headerSubtitle} 
                        onChange={(e) => updateField("headerSubtitle", e.target.value)}
                        className="rounded-xl border-slate-200"
                        placeholder="e.g. Dept. of CSE"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label className="text-slate-700 font-bold block">Institution Letterhead Image</Label>
                    <div className="relative group">
                      {(headerPreview || organization?.headerImage) ? (
                        <div className="relative border-2 border-slate-100 rounded-2xl overflow-hidden h-40 bg-slate-50 flex items-center justify-center">
                          <img src={headerPreview || organization?.headerImage} alt="Header Preview" className="h-full w-full object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                             {headerPreview ? (
                               <Button size="icon" variant="secondary" className="rounded-full shadow-xl" onClick={() => { setHeaderFile(null); setHeaderPreview(null); }}>
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             ) : (
                               <Button size="icon" variant="destructive" className="rounded-full shadow-xl" onClick={() => removeImage("header")}>
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             )}
                          </div>
                          {headerPreview && (
                            <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-1 rounded-full font-bold animate-pulse">
                              Pending Save
                            </div>
                          )}
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-slate-200 rounded-2xl h-40 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary cursor-pointer transition-all bg-slate-50/50"
                          onClick={() => headerFileRef.current?.click()}
                        >
                          {uploadingHeader ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-8 w-8 mb-2" />
                              <span className="text-sm font-medium">Upload Header Banner</span>
                            </>
                          )}
                        </div>
                      )}
                      <input type="file" ref={headerFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "header")} />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">Recommended Size: 1000x200px. High resolution results in better PDF clarity.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-slate-400" />
                    Footer & Seals
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Footer Audit / Bottom Text</Label>
                    <Input 
                      value={form.footerText} 
                      onChange={(e) => updateField("footerText", e.target.value)}
                      className="rounded-xl border-slate-200"
                      placeholder="e.g. Verified by Accreditation Board"
                    />
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label className="text-slate-700 font-bold block">Official Seal / QR / Stamp</Label>
                    <div className="relative group">
                      {(footerPreview || organization?.footerImage) ? (
                        <div className="relative border-2 border-slate-100 rounded-2xl overflow-hidden h-32 bg-slate-50 flex items-center justify-center">
                          <img src={footerPreview || organization?.footerImage} alt="Footer Preview" className="h-full w-full object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             {footerPreview ? (
                               <Button size="icon" variant="secondary" className="rounded-full shadow-xl" onClick={() => { setFooterFile(null); setFooterPreview(null); }}>
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             ) : (
                               <Button size="icon" variant="destructive" className="rounded-full shadow-xl" onClick={() => removeImage("footer")}>
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             )}
                          </div>
                          {footerPreview && (
                            <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-1 rounded-full font-bold animate-pulse">
                              Pending Save
                            </div>
                          )}
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-slate-200 rounded-2xl h-32 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary cursor-pointer transition-all bg-slate-50/50"
                          onClick={() => footerFileRef.current?.click()}
                        >
                          {uploadingFooter ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-8 w-8 mb-2" />
                              <span className="text-sm font-medium">Upload Seal/Stamp</span>
                            </>
                          )}
                        </div>
                      )}
                      <input type="file" ref={footerFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "footer")} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-400" />
                    Signature Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold">Left Signature Label</Label>
                      <Input 
                        value={form.signatureLeftLabel} 
                        onChange={(e) => updateField("signatureLeftLabel", e.target.value)}
                        className="rounded-xl border-slate-200"
                        placeholder="e.g. Name & Signature of Co-ordinator"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold">Right Signature Label</Label>
                      <Input 
                        value={form.signatureRightLabel} 
                        onChange={(e) => updateField("signatureRightLabel", e.target.value)}
                        className="rounded-xl border-slate-200"
                        placeholder="e.g. Principal"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Right Signature Name (Optional)</Label>
                    <Input 
                      value={form.signatureRightName} 
                      onChange={(e) => updateField("signatureRightName", e.target.value)}
                      className="rounded-xl border-slate-200"
                      placeholder="e.g. Fr. Dr. Joshy George"
                    />
                    <p className="text-[10px] text-muted-foreground italic">If provided, this will appear below the right signature label.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Card className="mt-12 overflow-hidden border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <CardContent className="p-10 flex items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
               <BadgeCheck className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Cloudinary Asset Sync</h3>
              <p className="text-slate-600 mt-1 max-w-2xl text-sm leading-relaxed">
                Images are automatically renamed to your organization slug for better asset management. 
                When an image is removed from here, it is permanently deleted from your Cloudinary cloud to keep storage clean.
              </p>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-2xl font-black text-slate-900">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                Unsaved Changes
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 text-base py-2">
                You have made changes to your organization settings that haven&apos;t been saved yet. 
                If you leave now, these changes will be lost forever.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
              <AlertDialogAction 
                onClick={() => {
                  setIsDirty(false);
                  if (pendingUrl) router.push(pendingUrl);
                }}
                className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold h-12 px-6 border-none"
              >
                Discard & Exit
              </AlertDialogAction>
              


              <Button 
                onClick={async () => {
                  await handleSubmit();
                  if (pendingUrl) router.push(pendingUrl);
                }}
                className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 shadow-lg flex gap-2"
              >
                <Save className="h-4 w-4" />
                Save & Exit
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
