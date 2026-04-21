import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUpload = async (file: string, publicId: string, folder = "docgen_branding") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      public_id: publicId,
      overwrite: true,
      invalidate: true,
      folder: folder,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};

export const cloudinaryDelete = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    // We don't necessarily want to throw here if the file is already gone
  }
};

export default cloudinary;
