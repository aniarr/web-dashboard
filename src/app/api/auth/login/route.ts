import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/session";
import { ensureSeedData, getUserByEmail } from "@/lib/storage";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await ensureSeedData();
    const input = loginSchema.parse(await request.json());
    const user = await getUserByEmail(input.email);

    if (!user || user.password !== input.password) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    await createSession(user.id, user.role);
    return NextResponse.json({ user, token: "session-cookie" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
