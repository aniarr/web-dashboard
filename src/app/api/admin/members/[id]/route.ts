import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { createAuditLog, deleteUser, ensureSeedData, getUser, updateUser } from "@/lib/storage";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await ensureSeedData();
    const user = await getSessionUser();
    if (!user || !["admin", "super_admin"].includes(user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const targetUser = await getUser(id);
    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role === "admin") {
      if (targetUser.organizationId !== user.organizationId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      if (targetUser.role === "super_admin") {
        return NextResponse.json({ message: "Cannot modify super_admin" }, { status: 403 });
      }
    }

    const input = await request.json();
    
    if (user.role === "admin") {
        // Prevent changing organization for safety
        delete input.organizationId;
        if (input.role === "super_admin") {
             delete input.role;
        }
    }

    const updatedUser = await updateUser(id, input);
    if (!updatedUser) {
      return NextResponse.json({ message: "Failed to update user" }, { status: 400 });
    }

    await createAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "user.update",
      entityType: "user",
      entityId: updatedUser.id,
      message: `${user.email} updated user ${updatedUser.email}`,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await ensureSeedData();
    const user = await getSessionUser();
    if (!user || !["admin", "super_admin"].includes(user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const targetUser = await getUser(id);
    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role === "admin") {
      if (targetUser.organizationId !== user.organizationId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      if (targetUser.role === "super_admin") {
        return NextResponse.json({ message: "Cannot delete super_admin" }, { status: 403 });
      }
    }

    if (targetUser.id === user.id) {
      return NextResponse.json({ message: "Cannot delete yourself" }, { status: 400 });
    }

    await deleteUser(id);

    await createAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "user.delete",
      entityType: "user",
      entityId: id,
      message: `${user.email} deleted user ${targetUser.email}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
