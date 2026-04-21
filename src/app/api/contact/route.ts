import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, inquiryPath, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "DocGen Support <support@amith.site>",
      to: ["anirudhanv51@gmail.com", "contact.inovuslabs@gmail.com"],
      subject: `New Inquiry: ${subject || inquiryPath}`,
      replyTo: email,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #000; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
          <p><strong>Type:</strong> ${inquiryPath}</p>
          <p><strong>Subject:</strong> ${subject || "No Subject"}</p>
          <div style="margin-top: 20px; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #0f172a; border-radius: 4px;">
            <p style="margin-top: 0;"><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; font-size: 15px; line-height: 1.6;">${message}</p>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #eee; pt-10px;">
            Sent via DocGen Contact System
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend delivery failed:", error);
      return NextResponse.json({ 
        message: "Failed to send email", 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
