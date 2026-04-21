"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Loader2, Printer, Save, Sparkles, FileText, Calendar, Users, Briefcase, FileSearch, Flag } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import { useRequireAuth } from "@/hooks/use-auth";
import { useCreateReport, usePreviewReport, useUpdateReport } from "@/hooks/use-reports";
import { useAdminOrganization } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function CreateReportPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading: authLoading } = useRequireAuth();
  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const previewReport = usePreviewReport();
  const { data: organization } = useAdminOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ report: string; feedback: string; outcome: string } | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setConfirmOpen(true);
  };

  const handleSave = async (silent = false) => {
    if (!user || isSaved) return;

    setSaving(true);
    try {
      if (lastSavedId) {
        // Update existing report
        await updateReport.mutateAsync({
          id: lastSavedId,
          data: {
            title: form.title || "Untitled report",
            details: JSON.stringify(form, null, 2),
          }
        });
      } else {
        // Create new report
        const result = await createReport.mutateAsync({
          userId: user.id,
          title: form.title || "Untitled report",
          details: JSON.stringify(form, null, 2),
        });
        setLastSavedId(result.id);
      }
      setIsSaved(true);
      if (!silent) {
        toast({ 
          title: "Report saved", 
          description: "The report has been saved to your history.",
          variant: "success",
        });
      }
    } catch (error) {
      if (!silent) {
        toast({ 
          title: "Save failed", 
          description: error instanceof Error ? error.message : "Unable to save report", 
          variant: "destructive" 
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    
    if (!isSaved) {
      await handleSave(true);
    }
    
    setDownloading(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);

      // 1. Capture Header, Signatures, and Branding Footer
      const headerEl = document.getElementById("report-header");
      const signaturesEl = document.getElementById("report-signatures");
      const brandingFooterEl = document.getElementById("report-branding-footer");
      
      const headerCanvas = headerEl ? await html2canvas(headerEl, { scale: 2, useCORS: true }) : null;
      const signaturesCanvas = signaturesEl ? await html2canvas(signaturesEl, { scale: 2, useCORS: true }) : null;
      const brandingFooterCanvas = brandingFooterEl ? await html2canvas(brandingFooterEl, { scale: 2, useCORS: true }) : null;

      const headerImg = headerCanvas?.toDataURL("image/png");
      const signaturesImg = signaturesCanvas?.toDataURL("image/png");
      const brandingFooterImg = brandingFooterCanvas?.toDataURL("image/png");

      const headerHeight = headerCanvas ? (headerCanvas.height * contentWidth) / headerCanvas.width : 0;
      const signaturesHeight = signaturesCanvas ? (signaturesCanvas.height * contentWidth) / signaturesCanvas.width : 0;
      const brandingFooterHeight = brandingFooterCanvas ? (brandingFooterCanvas.height * contentWidth) / brandingFooterCanvas.width : 0;

      // 2. Capture all rows
      const rows = Array.from(document.querySelectorAll("#report-body tr")) as HTMLTableRowElement[];
      const rowCanvases = await Promise.all(rows.map(row => html2canvas(row, { scale: 2, useCORS: true })));

      let currentY = margin;
      let firstPage = true;

      const addNewPage = () => {
        // Before adding a new page, add the branding footer to the current one
        if (!firstPage && brandingFooterImg) {
          pdf.addImage(brandingFooterImg, "PNG", margin, pageHeight - brandingFooterHeight - margin, contentWidth, brandingFooterHeight);
        }

        if (!firstPage) pdf.addPage();
        firstPage = false;
        currentY = margin;
        
        // Add header to each page
        if (headerImg) {
          pdf.addImage(headerImg, "PNG", margin, currentY, contentWidth, headerHeight);
          currentY += headerHeight + 5;
        }
      };

      const addSignatures = () => {
        if (signaturesImg) {
          pdf.addImage(signaturesImg, "PNG", margin, currentY, contentWidth, signaturesHeight);
          currentY += signaturesHeight + 5;
        }
      };

      const addBrandingFooter = () => {
        if (brandingFooterImg) {
          pdf.addImage(brandingFooterImg, "PNG", margin, pageHeight - brandingFooterHeight - margin, contentWidth, brandingFooterHeight);
        }
      };

      addNewPage();

      for (let i = 0; i < rowCanvases.length; i++) {
        const rowCanvas = rowCanvases[i];
        const rowHeight = (rowCanvas.height * contentWidth) / rowCanvas.width;

        // Check if row fits on current page (leaving space for branding footer)
        if (currentY + rowHeight + brandingFooterHeight + margin > pageHeight) {
          addNewPage();
        }

        const rowImg = rowCanvas.toDataURL("image/png");
        pdf.addImage(rowImg, "PNG", margin, currentY, contentWidth, rowHeight);
        currentY += rowHeight;
      }

      // Check if signatures + branding footer fit on the last page
      if (currentY + signaturesHeight + brandingFooterHeight + margin > pageHeight) {
        addNewPage();
      }
      
      addSignatures();
      addBrandingFooter();
      
      pdf.save(`Report_${form.title?.replace(/\s+/g, "_") || "Document"}.pdf`);
      
      toast({ title: "Download complete", description: "Professional report generated with repeating headers.", variant: "success" });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast({ title: "Export failed", description: "There was an error generating the multi-page PDF.", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const processGeneration = async () => {
    if (!user) return;

    setLoading(true);
    setConfirmOpen(false);
    setIsSaved(false); // Reset saved status for new generation
    
    try {
      const response = await previewReport.mutateAsync(JSON.stringify(form, null, 2));
      setAiResponse(response.content);
      setGenerated(true);
      
      // Scroll to preview somewhat smoothly after a short delay
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
      
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Unable to generate the report preview.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || authLoading || !user) {
    return (
      <DashboardLayout>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-72" />
          </div>
        </div>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-6 mt-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout mode={user.role === "super_admin" ? "super_admin" : user.role === "admin" ? "admin" : "member"}>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Create Event Report
          </h1>
          <p className="mt-1 text-muted-foreground">Fill in the details to generate a comprehensive AI-powered report.</p>
        </div>
        
        <AnimatePresence>
          {generated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button 
                variant="outline" 
                onClick={() => { setGenerated(false); setForm({}); setAiResponse(null); setIsSaved(false); }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Start Over
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-8">
        {/* Main Form Card */}
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Title of Activity <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="title" name="title" value={form.title || ""} onChange={handleChange} required 
                      placeholder="e.g. Annual Tech Symposium 2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" /> Date <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="date" type="date" name="date" value={form.date || ""} onChange={handleChange} required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" /> Department / Club <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="department" name="department" value={form.department || ""} onChange={handleChange} required 
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="students" className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Participant Count <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="students" name="students" type="text" value={form.students || ""} onChange={handleChange} required 
                      placeholder="e.g. 500+"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="faculties" className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Faculty Count <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="faculties" name="faculties" type="text" value={form.faculties || ""} onChange={handleChange} required 
                      placeholder="e.g. 10+"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mode" className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-primary" /> Mode <span className="text-destructive">*</span>
                    </Label>
                    <select 
                      id="mode" name="mode" value={form.mode || "Offline"} onChange={handleChange} required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Mode" 
                    >
                      <option>Offline</option>
                      <option>Online</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coordinator" className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Faculty Coordinator <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="coordinator" name="coordinator" value={form.coordinator || ""} onChange={handleChange} required 
                      placeholder="e.g. Roji Thomas"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <Label htmlFor="report" className="flex items-center gap-2">
                      <FileSearch className="h-4 w-4 text-primary" /> Report Keywords / Summary <span className="text-destructive">*</span>
                    </Label>
                    <Textarea 
                      id="report" name="report" value={form.report || ""} onChange={handleChange} required 
                      className="min-h-[120px] resize-y"
                      placeholder="Summarize the key events, speakers, and happenings..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="feedback" className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" /> Feedback Keywords <span className="text-destructive">*</span>
                      </Label>
                      <Textarea 
                        id="feedback" name="feedback" value={form.feedback || ""} onChange={handleChange} required 
                        className="min-h-[100px]"
                        placeholder="What did participants say?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outcome" className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-primary" /> Programme Outcome <span className="text-destructive">*</span>
                      </Label>
                      <Textarea 
                        id="outcome" name="outcome" value={form.outcome || ""} onChange={handleChange} required 
                        className="min-h-[100px]"
                        placeholder="What was the result or key takeaway?"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full sm:w-auto min-w-[200px]"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Magic...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {generated ? "Regenerate Preview" : "Generate Beautiful Report"}
                      </>
                    )}
                  </Button>
                </motion.div>

                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" /> Generate AI Report?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will use AI to expand your keywords into a comprehensive, professional report preview. It will not be saved until you explicitly click Save.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={processGeneration}>
                        Confirm Generation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview Section */}
        <AnimatePresence>
          {generated && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              className="space-y-6 pb-20"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/50 p-4 rounded-xl border border-border sticky top-4 z-20">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Report Preview
                </h2>
                <div className="flex flex-wrap justify-end gap-3 w-full md:w-auto">

                  <Button 
                    onClick={() => handleSave()} 
                    disabled={isSaved || saving} 
                    variant={isSaved ? "secondary" : "outline"}
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {isSaved ? "Saved to History" : "Save to History"}
                  </Button>
                  <Button 
                    onClick={downloadPDF} 
                    disabled={downloading}
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Preparing PDF...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="rounded-xl border border-border bg-muted/30 p-4 md:p-8 shadow-inner overflow-x-auto flex justify-center">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  ref={reportRef} 
                  className="w-full max-w-[794px] min-h-[1123px] bg-white p-8 md:p-[60px] shadow-lg relative text-black shrink-0 origin-top"
                >
                  <div className="border-2 border-slate-950 p-4 min-h-full flex flex-col" id="report-content">
                    <div className="mb-8 text-center" id="report-header">
                      {organization?.headerImage ? (
                        <img src={organization.headerImage} className="w-full h-auto object-contain max-h-[160px]" alt="Organization header" />
                      ) : (
                        <div className="py-4">
                          <img src="/favicon.png" className="mx-auto mb-2 h-16 object-contain" alt="Default logo" />
                          <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{organization?.name || "YOUR COLLEGE NAME"}</h1>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department of {form.department || "..."}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex-1" id="report-body">
                      <table className="w-full border-collapse border border-slate-300 text-sm mb-8">
                        <tbody>
                          <tr>
                            <td className="w-1/3 border border-slate-300 p-3 font-bold bg-slate-50">Title of Activity</td>
                            <td className="border border-slate-300 p-3">{form.title || "---"}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Date</td>
                            <td className="border border-slate-300 p-3">{form.date || "---"}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Department/Club/Cell</td>
                            <td className="border border-slate-300 p-3">{form.department || "---"}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Total Student Participants</td>
                            <td className="border border-slate-300 p-3">{form.students || "0"}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Total Faculty Participants</td>
                            <td className="border border-slate-300 p-3">{form.faculties || "0"}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Faculty Coordinator</td>
                            <td className="border border-slate-300 p-3">{form.coordinator || "---"}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Report</td>
                            <td className="border border-slate-300 p-3 whitespace-pre-wrap text-justify leading-relaxed">
                              {aiResponse?.report || "Event details will appear here after generation..."}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Feedback Analysis</td>
                            <td className="border border-slate-300 p-3 whitespace-pre-wrap">
                              {aiResponse?.feedback || form.feedback || "---"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Programme Outcome</td>
                            <td className="border border-slate-300 p-3 whitespace-pre-wrap">
                              {Array.isArray(aiResponse?.outcome) ? (
                                <ul className="list-none p-0 m-0 space-y-1">
                                  {aiResponse.outcome.map((item, idx) => item && (
                                    <li key={idx} className="flex gap-2">
                                      <span className="shrink-0 text-slate-400 font-black">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                aiResponse?.outcome || form.outcome || "---"
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-20" id="report-signatures">
                      <div className="flex justify-between text-xs font-bold mb-16 px-4">
                        <div className="text-center w-64 group">
                          <div className="h-24 mb-2 border-2 border-dashed border-transparent group-hover:border-slate-100 rounded-xl flex items-center justify-center text-[10px] text-slate-200 italic font-normal">
                            (Physical Signature / Seal Area)
                          </div>
                          <div className="border-t-2 border-slate-900 pt-3 uppercase tracking-widest text-slate-900">
                            {organization?.signatureLeftLabel || "Event Coordinator"}
                          </div>
                        </div>
                        <div className="text-center w-64 group">
                          <div className="h-24 mb-2 border-2 border-dashed border-transparent group-hover:border-slate-100 rounded-xl flex items-center justify-center text-[10px] text-slate-200 italic font-normal">
                            (Physical Signature / Seal Area)
                          </div>
                          <div className="border-t-2 border-slate-900 pt-3 uppercase tracking-widest text-slate-900">
                            {organization?.signatureRightLabel || "Head of Department"}
                          </div>
                          {organization?.signatureRightName && (
                            <div className="mt-2 text-[11px] font-black text-slate-950 uppercase tracking-tight">
                              {organization.signatureRightName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div id="report-branding-footer">
                      {organization?.footerImage ? (
                        <div className="pt-4 border-t border-slate-100">
                          <img src={organization.footerImage} className="w-full h-auto object-contain max-h-[100px]" alt="Organization footer" />
                        </div>
                      ) : (
                        <div className="pt-4 border-t border-slate-100 text-center">
                          <p className="text-[10px] text-slate-400 italic">{organization?.footerText || "Official Record of Institution"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
