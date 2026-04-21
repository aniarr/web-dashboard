import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getAuditLogs } from "@/lib/storage";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Admins see all activity for their organization
  // Members only see their own activity
  const organizationId = user.role !== "super_admin" ? user.organizationId : undefined;
  const userId = user.role === "member" ? user.id : undefined;

  const logs = await getAuditLogs(10, organizationId, userId);
  return NextResponse.json(logs);
}
