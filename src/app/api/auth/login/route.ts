import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import { createAuditLog, ensureSeedData, getSiteSettings, getUserByEmail, updateUser } from "@/lib/storage";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await ensureSeedData();
    const settings = await getSiteSettings();
    if (settings?.maintenanceMode) {
      return NextResponse.json({ message: "The platform is currently in maintenance mode" }, { status: 503 });
    }
    const input = loginSchema.parse(await request.json());
    const user = await getUserByEmail(input.email);
    if (!user) {
      return NextResponse.json({ message: "Email not found", field: "email" }, { status: 401 });
    }

    if (!(await bcrypt.compare(input.password, user.password))) {
      return NextResponse.json({ message: "Incorrect password", field: "password" }, { status: 401 });
    }

    const sessionId = crypto.randomUUID();
    await updateUser(user.id, { currentSessionId: sessionId });

    await createSession(user.id, user.role, sessionId);
    await createAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "auth.login",
      entityType: "auth",
      entityId: user.id,
      message: `${user.email} logged in`,
      organizationId: user.organizationId,
      metadata: {},
    });
    return NextResponse.json({ user, token: "session-cookie" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
