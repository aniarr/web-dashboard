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
      from: "Mr DocGen Auth <onboarding@resend.dev>",
      to: [email],
      subject: "Your Signup Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #000;">Welcome to Mr DocGen</h2>
          <p>Please use the following verification code to complete your signup:</p>
          <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 12px; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ message: "Failed to send verification email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
