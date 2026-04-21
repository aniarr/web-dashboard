import { NextResponse } from "next/server";
import { z } from "zod";
import { siteSettingsSchema } from "@/lib/schema";
import { getSessionUser } from "@/lib/session";
import { createAuditLog, ensureSeedData, getSiteSettings, updateSiteSettings } from "@/lib/storage";

const updateSettingsSchema = siteSettingsSchema.partial();

export async function GET() {
  await ensureSeedData();
  const user = await getSessionUser();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getSiteSettings());
}

export async function PATCH(request: Request) {
  try {
    await ensureSeedData();
    const user = await getSessionUser();
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const input = updateSettingsSchema.parse(await request.json());
    const settings = await updateSiteSettings(input);
    await createAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "site_settings.update",
      entityType: "site_settings",
      entityId: settings.id,
      message: `${user.email} updated platform settings`,
      metadata: input,
    });
    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
