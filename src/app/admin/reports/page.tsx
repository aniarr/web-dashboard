"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Eye, FileText, Search, Download, Printer, Loader2, Trash2, X } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useAdminReports, useAdminOrganization } from "@/hooks/use-admin";
import { useRequireAuth } from "@/hooks/use-auth";
import { useDeleteReport } from "@/hooks/use-reports";
import { useToast } from "@/hooks/use-toast";
import type { Report } from "@/lib/schema";

export default function AdminReportsPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading: authLoading } = useRequireAuth(true);
  const { data: reports, isLoading } = useAdminReports();
  const { data: organization } = useAdminOrganization();
  const deleteReport = useDeleteReport();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredReports = useMemo(() => {
    return (reports ?? []).filter(report => 
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      (report.userName || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [reports, search]);

  const parsedDetails = useMemo(() => {
    if (!selectedReport) return null;
    try {
      return JSON.parse(selectedReport.details);
    } catch {
      return null;
    }
  }, [selectedReport]);

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
      await deleteReport.mutateAsync(reportToDelete);
      toast({ title: "Report deleted", description: "The report has been removed successfully.", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete report.", variant: "destructive" });
    } finally {
      setReportToDelete(null);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current || !selectedReport) return;
    
    setDownloading(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Report_${selectedReport.title.replace(/\s+/g, "_")}.pdf`);
      toast({ title: "Success", description: "Report downloaded successfully.", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  if (!mounted || authLoading || !user) {
    return (
      <DashboardLayout mode="admin">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-56" />
          </div>
          <Skeleton className="h-10 w-full max-w-xs rounded-full" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="pl-6 py-4">Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden md:table-cell">Metadata</TableHead>
                  <TableHead className="pr-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout mode="admin">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Organization Reports</h1>
          <p className="mt-1 text-muted-foreground">Monitor and review documents authored by your team.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search titles..." 
            className="pl-9 bg-background focus:ring-primary rounded-full" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-2xl bg-white/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow>
                <TableHead className="pl-6 py-4 font-bold text-slate-700">TITLE</TableHead>
                <TableHead className="font-bold text-slate-700">AUTHOR</TableHead>
                <TableHead className="font-bold text-slate-700">DATE</TableHead>
                <TableHead className="hidden md:table-cell font-bold text-slate-700">METADATA SUMMARY</TableHead>
                <TableHead className="pr-6 text-right font-bold text-slate-700">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : filteredReports?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium">
                    No reports found matching your search.
                  </TableCell>
                </TableRow>
              ) : filteredReports?.map((report) => (
                <TableRow key={report.id} className="hover:bg-primary/5 transition-all duration-200">
                  <TableCell className="flex items-center gap-2 pl-6 py-5 font-semibold text-slate-800">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    {report.title}
                  </TableCell>
                  <TableCell className="text-sm text-slate-700 font-medium">{report.userName}</TableCell>
                  <TableCell className="text-sm text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[300px] truncate text-xs text-slate-400 font-mono">
                    {report.details}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-9 w-9 text-primary border-primary/20 hover:bg-primary/10 hover:border-primary/50 transition-colors" onClick={() => setSelectedReport(report)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/50 transition-colors" onClick={() => setReportToDelete(String(report.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This action cannot be undone. This will permanently delete the report <strong>"{filteredReports.find(r => String(r.id) === reportToDelete)?.title}"</strong> from the system cache.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="rounded-full border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full px-8 shadow-lg shadow-destructive/20">
              Delete Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Modal */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] p-0 border-none bg-slate-100 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.3)] overflow-y-auto custom-scrollbar">
          {selectedReport && parsedDetails && (
            <div className="flex flex-col min-h-full bg-slate-200/50">
              <div className="sticky top-0 z-10 w-full bg-white px-8 py-5 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-xl">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-900">
                      {selectedReport.title}
                    </DialogTitle>
                    <p className="text-xs text-slate-500 font-medium">Generated on {new Date(selectedReport.createdAt).toLocaleDateString()} | By {selectedReport.userName}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:flex border-2 font-bold h-10 rounded-full hover:bg-slate-50 transition-colors">
                    <Printer className="mr-2 h-4 w-4" /> Print
                  </Button>
                  <Button size="sm" onClick={downloadPDF} disabled={downloading} className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold h-10 rounded-full px-6 transition-transform active:scale-95">
                    {downloading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Export PDF
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-0 sm:p-6 md:p-12 bg-slate-200/50">
                <div 
                  ref={reportRef} 
                  className="mx-auto w-full max-w-[794px] min-h-screen md:min-h-[1123px] bg-white p-6 sm:p-12 md:p-[80px] md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative text-black sm:rounded-sm md:border md:border-slate-300 transform-gpu"
                >
                  <div className="mb-6 sm:mb-8 text-center relative px-2">
                    {organization?.headerImage ? (
                      <div className="w-full h-auto overflow-hidden rounded-xl">
                        <img 
                          src={organization.headerImage} 
                          className="w-full h-auto object-contain max-h-[160px]" 
                          alt="Custom Organization Header" 
                        />
                      </div>
                    ) : (
                      <>
                        <div className="hidden lg:block absolute top-0 right-0 text-[10px] font-mono text-slate-300 opacity-50">#REPORT-{String(selectedReport.id).slice(-6).toUpperCase()}</div>
                        <img src="/favicon.png" className="mx-auto mb-3 h-14 w-14 sm:h-20 sm:w-20 object-contain" alt="College logo" />
                        <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                          {organization?.headerTitle || "YOUR COLLEGE NAME"}
                        </h1>
                        <p className="text-[9px] sm:text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
                          {organization?.headerSubtitle || "Department of Computer Science"}
                        </p>
                        <div className="mt-3 h-1 w-12 sm:w-24 bg-primary/20 mx-auto rounded-full" />
                      </>
                    )}
                  </div>

                  <hr className="mb-5 sm:mb-8 border-slate-200" />
                  <h2 className="mb-6 sm:mb-10 text-center text-base sm:text-2xl font-extrabold underline underline-offset-4 sm:underline-offset-8 decoration-primary/30 uppercase tracking-tight text-slate-900 leading-snug px-2">{selectedReport.title}</h2>
                  
                  <div className="space-y-5 sm:space-y-8 text-xs sm:text-[15px] leading-relaxed text-slate-800 px-2 sm:px-0">
                    <p className="text-justify font-serif italic text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11px] sm:text-sm leading-normal">
                      &quot;{organization?.footerText || "This document serves as an official administrative record detailing the proceedings and outcomes of the event conducted by the institution."}&quot;
                    </p>

                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-sm sm:text-lg font-black text-slate-900 border-l-4 border-primary pl-3 py-0.5">Contextual Background</h3>
                      <p className="text-justify whitespace-pre-wrap leading-relaxed sm:leading-loose tracking-tight">{selectedReport.content}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 my-6 sm:my-10">
                      <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-3 sm:space-y-4">
                        <h4 className="text-[10px] sm:text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Event Metadata
                        </h4>
                        <ul className="space-y-2 sm:space-y-3 text-[11px] sm:text-sm">
                          <li className="flex justify-between border-b border-slate-200 pb-1.5"><span className="text-slate-500">Date</span> <span className="font-bold">{parsedDetails.date || "-"}</span></li>
                          <li className="flex justify-between border-b border-slate-200 pb-1.5"><span className="text-slate-500">Department</span> <span className="font-bold truncate max-w-[150px]">{parsedDetails.department || "-"}</span></li>
                          <li className="flex justify-between border-b border-slate-200 pb-1.5"><span className="text-slate-500">Mode</span> <span className="font-bold uppercase text-[9px] px-1.5 py-0.5 bg-slate-200 rounded-full">{parsedDetails.mode || "-"}</span></li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-3 sm:space-y-4">
                        <h4 className="text-[10px] sm:text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Participation Metrics
                        </h4>
                        <ul className="space-y-2 sm:space-y-3 text-[11px] sm:text-sm">
                          <li className="flex justify-between border-b border-slate-200 pb-1.5"><span className="text-slate-500">Students</span> <span className="font-bold text-primary">{parsedDetails.students || "0"}</span></li>
                          <li className="flex justify-between border-b border-slate-200 pb-1.5"><span className="text-slate-500">Faculties</span> <span className="font-bold text-primary">{parsedDetails.faculties || "0"}</span></li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4 pt-1 shrink-0">
                      <h3 className="text-sm sm:text-lg font-black text-slate-900 border-l-4 border-primary pl-3 py-0.5">Feedback Summary</h3>
                      <div className="bg-slate-50/50 p-3 sm:p-4 rounded-xl text-slate-700 italic border border-slate-100 text-[11px] sm:text-sm">
                        {parsedDetails.feedback || "No feedback recorded."}
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4 pt-1 shrink-0">
                      <h3 className="text-sm sm:text-lg font-black text-slate-900 border-l-4 border-primary pl-3 py-0.5">Outcomes & Achievements</h3>
                      <div className="bg-slate-50/50 p-3 sm:p-4 rounded-xl text-slate-700 font-medium border border-slate-100 text-[11px] sm:text-sm">
                        {parsedDetails.outcome || "No outcomes recorded."}
                      </div>
                    </div>

                    {organization?.footerImage && (
                      <div className="mt-8 flex justify-center border-t border-slate-100 pt-8 opacity-90 grayscale hover:grayscale-0 transition-all duration-300">
                        <img 
                          src={organization.footerImage} 
                          className="max-h-[100px] object-contain" 
                          alt="Custom Footer Branding" 
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-12 sm:mt-32 flex flex-col sm:flex-row justify-between gap-10 sm:gap-12 text-[10px] sm:text-xs font-bold pt-10 sm:pt-12 border-t-2 border-slate-100">
                    <div className="text-center group">
                      <div className="mb-3 text-slate-300 opacity-50 text-[9px] group-hover:opacity-100 transition-opacity">Digital Signature Placeholder</div>
                      <div className="mb-2 h-0.5 w-full sm:w-40 bg-slate-950 mx-auto" />
                      <div className="uppercase tracking-widest text-slate-400 font-black mb-0.5">Event Coordinator</div>
                      <div className="text-[9px] text-slate-300 font-mono">Date: {new Date().toLocaleDateString()}</div>
                    </div>
                    <div className="text-center group">
                      <div className="mb-3 text-slate-300 opacity-50 text-[9px] group-hover:opacity-100 transition-opacity whitespace-nowrap">HOD Signature Verified</div>
                      <div className="mb-2 h-0.5 w-full sm:w-40 bg-slate-950 mx-auto" />
                      <div className="uppercase tracking-widest text-slate-400 font-black mb-0.5">Head of Department</div>
                      <div className="text-[9px] text-slate-300 font-mono uppercase">STAMP SECURED</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
