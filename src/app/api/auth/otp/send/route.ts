import { NextResponse } from "next/server";
import { Resend } from "resend";
import { OtpModel, UserModel } from "@/lib/storage";
import { connectToDatabase } from "@/lib/mongodb";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database (will expire in 10 mins due to TTL index)
    await OtpModel.create({ email, code: otp });

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "DocGen Auth <auth@amith.site>",
      to: [email],
      subject: "Your Signup Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #000; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Verification Code</h2>
          <p>Please use the following code to complete your DocGen signup:</p>
          <div style="margin: 30px 0; padding: 30px; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 12px; text-align: center;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0f172a;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #64748b;">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend OTP delivery failed:", error);
      return NextResponse.json({ 
        message: "Failed to send verification email", 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
