import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getOrganizationsByIds, getOrganizations } from "@/lib/storage";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Super admins see all organizations
  if (user.role === "super_admin") {
    const orgs = await getOrganizations();
    return NextResponse.json(orgs);
  }

  // Others see only their organizations
  const ids = [...(user.organizationIds || [])];
  if (user.organizationId && !ids.includes(user.organizationId)) {
    ids.push(user.organizationId);
  }

  const orgs = await getOrganizationsByIds(ids);
  return NextResponse.json(orgs);
}
