import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/session";
import { createAuditLog, createUser, ensureSeedData, getSiteSettings, getUserByEmail, OtpModel, updateUser } from "@/lib/storage";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  otpCode: z.string().length(6, "Verification code must be 6 digits"),
});

export async function POST(request: Request) {
  try {
    await ensureSeedData();
    const settings = await getSiteSettings();
    if (settings && !settings.allowPublicSignup) {
      return NextResponse.json({ message: "Public signup is disabled" }, { status: 403 });
    }
    const input = registerSchema.parse(await request.json());

    // Verify OTP
    const otpRecord = await OtpModel.findOne({ email: input.email, code: input.otpCode }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return NextResponse.json({ message: "Invalid or expired verification code", field: "otpCode" }, { status: 400 });
    }

    // Delete OTP after use
    await OtpModel.deleteOne({ _id: otpRecord._id });

    const existingUser = await getUserByEmail(input.email);

    if (existingUser) {
      return NextResponse.json({ message: "Email already in use", field: "email" }, { status: 400 });
    }

    const user = await createUser({ ...input, role: settings?.defaultUserRole ?? "member" });
    const sessionId = crypto.randomUUID();
    await updateUser(user.id, { currentSessionId: sessionId });
    await createSession(user.id, user.role, sessionId);
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
