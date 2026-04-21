import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getOrganizationById, updateOrganization, ensureSeedData } from "@/lib/storage";
import { insertOrganizationSchema } from "@/lib/schema";

export async function GET() {
  await ensureSeedData();
  const user = await getSessionUser();
  if (!user || !user.organizationId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const organization = await getOrganizationById(user.organizationId);
  return NextResponse.json(organization);
}

export async function PATCH(request: Request) {
  await ensureSeedData();
  const user = await getSessionUser();
  if (!user || user.role !== "admin" || !user.organizationId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateOrganization(user.organizationId, body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
