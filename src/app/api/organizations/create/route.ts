import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { createOrganization, updateUser, getOrganizations, createAuditLog } from "@/lib/storage";
import { insertOrganizationSchema } from "@/lib/schema";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Auto-generate slug if title is provided but slug is not
    if (body.name && !body.slug) {
        body.slug = body.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const validated = insertOrganizationSchema.parse(body);

    // Check if slug exists
    const allOrgs = await getOrganizations();
    if (allOrgs.some(o => o.slug === validated.slug)) {
        return NextResponse.json({ message: "An organization with this slug already exists" }, { status: 400 });
    }

    const organization = await createOrganization(validated);
    
    // Add org to user's list and set it as active
    const newOrgIds = [...(user.organizationIds || [])];
    if (!newOrgIds.includes(organization.id)) {
        newOrgIds.push(organization.id);
    }

    // Add to admin list for this specific org
    const newAdminOrgIds = [...(user.adminOrganizationIds || [])];
    if (!newAdminOrgIds.includes(organization.id)) {
        newAdminOrgIds.push(organization.id);
    }
    
    // Set role to admin for the current session/active state
    const newRole = user.role === "super_admin" ? "super_admin" : "admin";
    
    await updateUser(user.id, { 
        organizationIds: newOrgIds,
        organizationId: organization.id,
        role: newRole,
        adminOrganizationIds: newAdminOrgIds
    });

    await createAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "organization.create",
      entityType: "organization",
      entityId: organization.id,
      message: `${user.name} created organization: ${organization.name}`,
      organizationId: organization.id,
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Create org error:", error);
    return NextResponse.json({ message: "Creation failed" }, { status: 500 });
  }
}
