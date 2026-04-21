import { NextResponse } from "next/server";
import { z } from "zod";
import { insertUserSchema } from "@/lib/schema";
import { getSessionUser } from "@/lib/session";
import { createAuditLog, deleteUser, ensureSeedData, updateUser } from "@/lib/storage";

const updateUserSchema = insertUserSchema.partial();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureSeedData();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const input = updateUserSchema.parse(await request.json());
    const user = await updateUser(id, input);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await createAuditLog({
      actorUserId: currentUser.id,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: "user.update",
      entityType: "user",
      entityId: user.id,
      message: `${currentUser.email} updated user ${user.email}`,
      metadata: input,
    });

    return NextResponse.json(user);
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
  if (id === currentUser.id) {
    return NextResponse.json({ message: "You cannot delete your own super admin account" }, { status: 400 });
  }

  await deleteUser(id);
  await createAuditLog({
    actorUserId: currentUser.id,
    actorEmail: currentUser.email,
    actorRole: currentUser.role,
    action: "user.delete",
    entityType: "user",
    entityId: id,
    message: `${currentUser.email} deleted user ${id}`,
    metadata: {},
  });
  return NextResponse.json({ success: true });
}
