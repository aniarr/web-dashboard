import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { previewReport } from "@/lib/storage";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { details } = await request.json();
    const content = await previewReport(details);
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
