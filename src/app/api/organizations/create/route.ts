import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { createOrganization, updateUser, getOrganizations } from "@/lib/storage";
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

    // If the user was a member, maybe they should become an admin of their own org?
    // For now, keep their role but link it.
    await updateUser(user.id, { 
        organizationIds: newOrgIds,
        organizationId: organization.id 
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Create org error:", error);
    return NextResponse.json({ message: "Creation failed" }, { status: 500 });
  }
}
