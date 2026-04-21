import { NextResponse } from "next/server";
import { z } from "zod";
import { insertReportSchema } from "@/lib/schema";
import { getSessionUser } from "@/lib/session";
import { createReport, ensureSeedData, getReports, getReportsByUser, createAuditLog } from "@/lib/storage";

export async function GET() {
  await ensureSeedData();
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const reports = user.role === "super_admin" 
    ? await getReports() 
    : (user.role === "admin" ? await getReports(user.organizationId) : await getReportsByUser(user.id));
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  try {
    await ensureSeedData();
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const input = insertReportSchema.parse(await request.json());
    const report = await createReport({ ...input, userId: user.id });
    
    await createAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "report.create",
      entityType: "user",
      entityId: report.id,
      message: `${user.name} created report: ${report.title}`,
      organizationId: user.organizationId,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const field = error.errors[0]?.path?.join(".");
      return NextResponse.json({ message: error.errors[0]?.message ?? "Invalid input", field }, { status: 400 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
