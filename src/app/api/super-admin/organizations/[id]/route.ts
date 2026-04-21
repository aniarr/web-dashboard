import { NextResponse } from "next/server";
import { z } from "zod";
import { insertOrganizationSchema } from "@/lib/schema";
import { getSessionUser } from "@/lib/session";
import { createAuditLog, deleteOrganization, ensureSeedData, updateOrganization } from "@/lib/storage";

const updateOrganizationSchema = insertOrganizationSchema.partial();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureSeedData();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const input = updateOrganizationSchema.parse(await request.json());
    const organization = await updateOrganization(id, input);
    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    await createAuditLog({
      actorUserId: currentUser.id,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: "organization.update",
      entityType: "organization",
      entityId: organization.id,
      message: `${currentUser.email} updated organization ${organization.name}`,
      metadata: input,
    });

    return NextResponse.json(organization);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeedData();
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== "super_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteOrganization(id);
  await createAuditLog({
    actorUserId: currentUser.id,
    actorEmail: currentUser.email,
    actorRole: currentUser.role,
    action: "organization.delete",
    entityType: "organization",
    entityId: id,
    message: `${currentUser.email} deleted organization ${id}`,
    metadata: {},
  });
  return NextResponse.json({ success: true });
}
