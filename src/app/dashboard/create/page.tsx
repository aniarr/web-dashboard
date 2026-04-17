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
import { useCreateReport, usePreviewReport } from "@/hooks/use-reports";
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
  const previewReport = usePreviewReport();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [output, setOutput] = useState("");
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
      await createReport.mutateAsync({
        userId: user.id,
        title: form.title || "Untitled report",
        details: JSON.stringify(form, null, 2),
      });
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
    
    // Automatically save if not already saved
    if (!isSaved) {
      await handleSave(true);
    }
    
    setDownloading(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Report_${form.title?.replace(/\s+/g, "_") || "Document"}.pdf`);
      
      toast({ 
        title: "Download complete", 
        description: "The report has been saved as a PDF.",
        variant: "success",
      });
    } catch (error) {
      toast({ 
        title: "Download failed", 
        description: "An error occurred while generating the PDF.", 
        variant: "destructive" 
      });
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
      setOutput(response.content);
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
                onClick={() => { setGenerated(false); setForm({}); setOutput(""); setIsSaved(false); }}
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
                      id="students" name="students" type="number" value={form.students || ""} onChange={handleChange} required 
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="faculties" className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Faculty Count <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="faculties" name="faculties" type="number" value={form.faculties || ""} onChange={handleChange} required 
                      placeholder="0"
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
                  <Button onClick={() => window.print()} variant="outline" className="hidden md:flex">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
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
                  <div className="mb-8 text-center">
                    <img src="/favicon.png" className="mx-auto mb-4 h-20 md:h-24 object-contain" alt="College logo" />
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">YOUR COLLEGE NAME</h1>
                    <p className="text-base md:text-lg text-gray-600 mt-1">Department of {form.department}</p>
                  </div>

                  <hr className="mb-8 border-t-2 border-gray-200" />
                  <h2 className="mb-8 text-center text-xl md:text-2xl font-bold uppercase tracking-tight text-gray-800 leading-snug">{form.title}</h2>
                  
                  <div className="space-y-8 text-sm md:text-base text-gray-800">
                    <p className="text-justify leading-relaxed text-lg">
                      The {form.department} successfully organized an event titled <strong className="text-black font-bold">&quot;{form.title}&quot;</strong> on <strong className="text-black">{form.date}</strong> in <strong className="text-black">{form.mode}</strong> mode. The programme was designed to provide valuable insights and practical knowledge to the participants.
                    </p>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h3 className="mb-4 font-bold text-gray-900 border-b-2 border-primary/20 w-max pb-1 uppercase tracking-wide text-sm">Event Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Department</p>
                          <p className="font-medium">{form.department}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Mode of Conduct</p>
                          <p className="font-medium">{form.mode}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Participants</p>
                          <p className="font-medium">{form.students} Students</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Faculties</p>
                          <p className="font-medium">{form.faculties} Members</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 font-bold text-gray-900 border-b border-gray-300 pb-2 text-lg">Detailed Report</h3>
                      <p className="whitespace-pre-wrap text-justify leading-relaxed">{output}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="mb-3 font-bold text-gray-900 border-b border-gray-300 pb-2">Feedback Analysis</h3>
                        <p className="leading-relaxed text-gray-700">{form.feedback}</p>
                      </div>

                      <div>
                        <h3 className="mb-3 font-bold text-gray-900 border-b border-gray-300 pb-2">Programme Outcome</h3>
                        <p className="leading-relaxed text-gray-700">{form.outcome}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-32 flex justify-between text-sm font-semibold pt-12 items-end">
                    <div className="text-center w-48">
                      <div className="border-b border-gray-400 mb-2"></div>
                      <div className="text-gray-600 uppercase tracking-widest text-xs">Event Coordinator</div>
                    </div>
                    <div className="text-center w-48">
                      <div className="border-b border-gray-400 mb-2"></div>
                      <div className="text-gray-600 uppercase tracking-widest text-xs">Head of Department</div>
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
