import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { ensureSeedData, getSuperAdminStats } from "@/lib/storage";

export async function GET() {
  await ensureSeedData();
  const user = await getSessionUser();

  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getSuperAdminStats());
}
