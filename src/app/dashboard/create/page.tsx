"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRequireAuth } from "@/hooks/use-auth";
import { useCreateReport } from "@/hooks/use-reports";
import { useToast } from "@/hooks/use-toast";

export default function CreateReportPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const { mutateAsync } = useCreateReport();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [output, setOutput] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const report = await mutateAsync({
        userId: user.id,
        title: form.title || "Untitled report",
        details: JSON.stringify(form, null, 2),
      });
      setOutput(report.content);
      setGenerated(true);
    } catch (error) {
      toast({
        title: "Report generation failed",
        description: error instanceof Error ? error.message : "Unable to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="p-8 text-muted-foreground">Loading report builder...</div>;
  }

  return (
    <DashboardLayout isAdmin={user.role === "admin"}>
      <div className="mx-auto max-w-5xl p-6">
        {!generated && (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h1 className="text-3xl font-bold">Create Event Report</h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title of Activity</Label>
                  <Input id="title" name="title" onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" name="date" onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="department">Department / Club</Label>
                  <Input id="department" name="department" onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="students">Students</Label>
                    <Input id="students" name="students" type="number" onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="faculties">Faculties</Label>
                    <Input id="faculties" name="faculties" type="number" onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="mode">Mode</Label>
                  <select id="mode" name="mode" onChange={handleChange} className="h-12 w-full rounded-lg border px-3" aria-label="Mode" defaultValue="Offline">
                    <option>Offline</option>
                    <option>Online</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="report">Report Keywords</Label>
                  <Textarea id="report" name="report" onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="feedback">Feedback Keywords</Label>
                  <Textarea id="feedback" name="feedback" onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="outcome">Programme Outcome</Label>
                  <Textarea id="outcome" name="outcome" onChange={handleChange} />
                </div>
                <Button className="h-12 w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" />
                      Generating
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {generated && (
          <div className="bg-gray-300 p-10">
            <div className="mx-auto min-h-[1123px] bg-white p-[60px] shadow-xl" style={{ width: "794px" }}>
              <Button onClick={() => { setGenerated(false); setForm({}); setOutput(""); }} variant="outline" className="mb-6">
                <ArrowLeft className="mr-2" />
                Back
              </Button>

              <div className="mb-6 text-center">
                <img src="/favicon.png" className="mx-auto mb-2 h-20" alt="College logo" />
                <h1 className="text-xl font-bold">YOUR COLLEGE NAME</h1>
                <p>Department of Computer Science</p>
              </div>

              <hr className="mb-6" />
              <h2 className="mb-6 text-center text-2xl font-bold underline">{form.title}</h2>
              <p className="mb-4 text-justify">
                The {form.department} organized the event titled <strong>&quot;{form.title}&quot;</strong> on {form.date} in {form.mode} mode.
              </p>
              <h3 className="mt-6 font-bold">Event Details</h3>
              <ul className="ml-6 list-disc">
                <li>Department: {form.department}</li>
                <li>Mode: {form.mode}</li>
                <li>Students: {form.students}</li>
                <li>Faculties: {form.faculties}</li>
              </ul>
              <h3 className="mt-6 font-bold">Report</h3>
              <p className="whitespace-pre-wrap text-justify">{output}</p>
              <h3 className="mt-6 font-bold">Feedback</h3>
              <p>{form.feedback}</p>
              <h3 className="mt-6 font-bold">Programme Outcome</h3>
              <p>{form.outcome}</p>
              <div className="mt-20 flex justify-between">
                <div>Event Coordinator</div>
                <div>Head of Department</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
