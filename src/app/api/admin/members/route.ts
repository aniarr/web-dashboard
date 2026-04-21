import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { ensureSeedData, getScopedUsersForAdmin } from "@/lib/storage";

export async function GET() {
  await ensureSeedData();
  const user = await getSessionUser();

  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getScopedUsersForAdmin(user));
}

import { z } from "zod";
import { insertUserSchema } from "@/lib/schema";
import { createUser, getUserByEmail, createAuditLog } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !["admin", "super_admin"].includes(user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const input = insertUserSchema.parse(json);

    // Admins can only assign organizationId that they belong to
    if (user.role === "admin") {
      input.organizationId = user.organizationId;
      // Admins cannot create super_admins
      if (input.role === "super_admin") {
        return NextResponse.json({ message: "Cannot create super_admin" }, { status: 403 });
      }
    }

    if (input.role === "admin" && input.organizationId) {
      input.adminOrganizationIds = [input.organizationId];
    }

    const existing = await getUserByEmail(input.email);
    if (existing) {
      return NextResponse.json({ message: "Email already in use", field: "email" }, { status: 400 });
    }

    const createdUser = await createUser(input);
    await createAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "user.create",
      entityType: "user",
      entityId: createdUser.id,
      message: `${user.email} created user ${createdUser.email}`,
      metadata: { role: createdUser.role, organizationId: createdUser.organizationId },
    });

    return NextResponse.json(createdUser, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
