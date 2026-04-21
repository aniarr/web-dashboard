import { NextResponse } from "next/server";
import { clearSession, getSessionUser } from "@/lib/session";
import { createAuditLog } from "@/lib/storage";

export async function POST() {
  const user = await getSessionUser();
  if (user) {
    await createAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "auth.logout",
      entityType: "auth",
      entityId: user.id,
      message: `${user.email} logged out`,
      metadata: {},
    });
  }
  await clearSession();
  return NextResponse.json({ success: true });
}
