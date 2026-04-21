import { NextResponse } from "next/server";
import { z } from "zod";
import { insertOrganizationSchema } from "@/lib/schema";
import { getSessionUser } from "@/lib/session";
import { createAuditLog, createOrganization, ensureSeedData, getOrganizationsWithStats } from "@/lib/storage";

export async function GET() {
  await ensureSeedData();
  const user = await getSessionUser();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getOrganizationsWithStats());
}

export async function POST(request: Request) {
  try {
    await ensureSeedData();
    const user = await getSessionUser();
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const input = insertOrganizationSchema.parse(await request.json());
    const organization = await createOrganization(input);
    await createAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "organization.create",
      entityType: "organization",
      entityId: organization.id,
      message: `${user.email} created organization ${organization.name}`,
      metadata: input,
    });
    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
