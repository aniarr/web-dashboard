import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getOrganizationStats } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Ensure user is part of the organization or is super_admin
  const isAuthorized = 
    user.role === "super_admin" || 
    user.organizationId === id || 
    user.organizationIds?.some(orgId => String(orgId) === id);

  if (!isAuthorized) {
    return NextResponse.json({ message: "Unauthorized to view these stats" }, { status: 403 });
  }

  try {
    const stats = await getOrganizationStats(id);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 });
  }
}
