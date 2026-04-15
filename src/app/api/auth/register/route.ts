import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/session";
import { createUser, ensureSeedData, getUserByEmail } from "@/lib/storage";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await ensureSeedData();
    const input = registerSchema.parse(await request.json());
    const existingUser = await getUserByEmail(input.email);

    if (existingUser) {
      return NextResponse.json({ message: "Email already in use", field: "email" }, { status: 400 });
    }

    const role = input.email.includes("admin") ? "admin" : "member";
    const user = await createUser({ ...input, role });
    await createSession(user.id, user.role);

    return NextResponse.json({ user, token: "session-cookie" }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
