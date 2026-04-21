import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { ensureSeedData, getAuditLogs } from "@/lib/storage";

export async function GET(request: Request) {
  await ensureSeedData();
  const user = await getSessionUser();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 100);
  return NextResponse.json(await getAuditLogs(limit));
}
