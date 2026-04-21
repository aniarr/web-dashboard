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
  DialogDescription,
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

  const parsedContent = useMemo(() => {
    if (!selectedReport) return null;
    try {
      return JSON.parse(selectedReport.content);
    } catch {
      // For old reports that stored plain text
      return { report: selectedReport.content, feedback: "", outcome: [] };
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
      
      pdf.save(`Report_${selectedReport.title.replace(/\s+/g, "_")}.pdf`);
      toast({ title: "Success", description: "Professional report generated with repeating headers.", variant: "success" });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast({ title: "Error", description: "Failed to generate multi-page PDF.", variant: "destructive" });
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
                    <DialogDescription className="text-xs text-slate-500 font-medium">
                      Generated on {new Date(selectedReport.createdAt).toLocaleDateString()} | By {selectedReport.userName}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3">

                  <Button size="sm" onClick={downloadPDF} disabled={downloading} className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold h-10 rounded-full px-4 sm:px-6 transition-transform active:scale-95">
                    {downloading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Export PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedReport(null)}
                    className="h-10 w-10 rounded-full hover:bg-slate-100 md:hidden"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-0 sm:p-6 md:p-12 bg-slate-200/50">
                <div 
                  ref={reportRef} 
                  className="mx-auto w-full max-w-[794px] min-h-[screen] md:min-h-[1123px] bg-white p-6 sm:p-12 md:p-[80px] md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative text-black sm:rounded-sm md:border md:border-slate-300 transform-gpu"
                >
                  <div className="border-2 border-slate-950 p-4 min-h-full flex flex-col" id="report-content">
                    <div className="mb-8 text-center" id="report-header">
                      {organization?.headerImage ? (
                        <img src={organization.headerImage} className="w-full h-auto object-contain max-h-[160px]" alt="Organization header" />
                      ) : (
                        <div className="py-4">
                          <img src="/favicon.png" className="mx-auto mb-2 h-16 object-contain" alt="Default logo" />
                          <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{organization?.name || "YOUR COLLEGE NAME"}</h1>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department of {parsedDetails.department || "..."}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex-1" id="report-body">
                      <table className="w-full border-collapse border border-slate-300 text-sm mb-8">
                        <tbody>
                          <tr>
                            <td className="w-1/3 border border-slate-300 p-3 font-bold bg-slate-50">Title of Activity</td>
                            <td className="border border-slate-300 p-3">{selectedReport.title || "---"}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Date</td>
                            <td className="border border-slate-300 p-3">{parsedDetails.date || "---"}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Department/Club/Cell</td>
                            <td className="border border-slate-300 p-3">{parsedDetails.department || "---"}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Total Student Participants</td>
                            <td className="border border-slate-300 p-3">{parsedDetails.students || "0"}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Total Faculty Participants</td>
                            <td className="border border-slate-300 p-3">{parsedDetails.faculties || "0"}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Faculty Coordinator</td>
                            <td className="border border-slate-300 p-3">{parsedDetails.coordinator || "---"}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Report</td>
                            <td className="border border-slate-300 p-3 whitespace-pre-wrap text-justify leading-relaxed">
                              {parsedContent?.report || "---"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Feedback Analysis</td>
                            <td className="border border-slate-300 p-3 whitespace-pre-wrap">
                              {parsedContent?.feedback || parsedDetails.feedback || "---"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50">Programme Outcome</td>
                            <td className="border border-slate-300 p-3 whitespace-pre-wrap">
                              {Array.isArray(parsedContent?.outcome || parsedDetails.outcome) ? (
                                <ul className="list-none p-0 m-0 space-y-1">
                                  {(parsedContent?.outcome || parsedDetails.outcome).map((item: any, idx: number) => item && (
                                    <li key={idx} className="flex gap-2">
                                      <span className="shrink-0 text-slate-400 font-black">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                parsedContent?.outcome || parsedDetails.outcome || "---"
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
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
