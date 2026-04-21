import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getOrganizationById, updateOrganization } from "@/lib/storage";
import { cloudinaryUpload, cloudinaryDelete } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin" || !user.organizationId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "header" | "footer";

    if (!file || !type) {
      return NextResponse.json({ message: "Missing file or type" }, { status: 400 });
    }

    const organization = await getOrganizationById(user.organizationId);
    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    // Folder structure: docgen_branding/org_slug
    const folder = `docgen_branding/${organization.slug}`;
    const publicId = type; // header or footer
    
    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinaryUpload(base64Image, publicId, folder);

    // Update database
    const updateData: any = {};
    if (type === "header") {
      updateData.headerImage = result.url;
      updateData.headerImagePublicId = result.publicId;
    } else {
      updateData.footerImage = result.url;
      updateData.footerImagePublicId = result.publicId;
    }

    const updated = await updateOrganization(user.organizationId, updateData);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin" || !user.organizationId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type } = await request.json();
    const organization = await getOrganizationById(user.organizationId);
    
    if (!organization) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const publicIdField = type === "header" ? "headerImagePublicId" : "footerImagePublicId";
    const imageUrlField = type === "header" ? "headerImage" : "footerImage";
    
    const publicId = (organization as any)[publicIdField];

    if (publicId) {
      await cloudinaryDelete(publicId);
    }

    const updateData: any = {};
    updateData[imageUrlField] = "";
    updateData[publicIdField] = "";

    const updated = await updateOrganization(user.organizationId, updateData);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Deletion failed" }, { status: 500 });
  }
}
