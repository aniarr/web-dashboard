import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { ensureSeedData } from "@/lib/storage";

export async function GET() {
  await ensureSeedData();
  const user = await getSessionUser(true);

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if ((user as any).sessionInvalidated) {
    return NextResponse.json({ 
      message: "Session invalidated", 
      code: "SESSION_EXPIRED_NEW_LOGIN" 
    }, { status: 401 });
  }

  return NextResponse.json({ user });
}
