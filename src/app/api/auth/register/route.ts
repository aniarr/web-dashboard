import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/session";
import { createAuditLog, createUser, ensureSeedData, getSiteSettings, getUserByEmail } from "@/lib/storage";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await ensureSeedData();
    const settings = await getSiteSettings();
    if (settings && !settings.allowPublicSignup) {
      return NextResponse.json({ message: "Public signup is disabled" }, { status: 403 });
    }
    const input = registerSchema.parse(await request.json());
    const existingUser = await getUserByEmail(input.email);

    if (existingUser) {
      return NextResponse.json({ message: "Email already in use", field: "email" }, { status: 400 });
    }

    const user = await createUser({ ...input, role: settings?.defaultUserRole ?? "member" });
    await createSession(user.id, user.role);
    await createAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "auth.register",
      entityType: "user",
      entityId: user.id,
      message: `${user.email} registered`,
      metadata: { role: user.role },
    });

    return NextResponse.json({ user, token: "session-cookie" }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
