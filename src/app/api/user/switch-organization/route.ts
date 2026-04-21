import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { updateUser, getOrganizationById } from "@/lib/storage";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { organizationId } = await request.json();
    
    // Super admins can switch to any organization
    // Others must be in the list
    if (user.role !== "super_admin" && (!user.organizationIds || !user.organizationIds.includes(organizationId))) {
      return NextResponse.json({ message: "Unauthorized to switch to this organization" }, { status: 403 });
    }

    const org = await getOrganizationById(organizationId);
    if (!org && organizationId !== undefined) {
        return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    let newRole = user.role;
    if (user.role !== "super_admin") {
      newRole = (user.adminOrganizationIds || []).includes(organizationId) ? "admin" : "member";
    }

    await updateUser(user.id, { organizationId, role: newRole });
    return NextResponse.json({ success: true, organizationId });
  } catch (error) {
    return NextResponse.json({ message: "Failed to switch organization" }, { status: 500 });
  }
}
