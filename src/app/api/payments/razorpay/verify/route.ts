import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionUser } from "@/lib/session";
import { createAuditLog } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planName
    } = await request.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
    
    // Verify signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
    }

    // Success - log the transaction
    await createAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "payment.verify",
      entityType: "user",
      entityId: user.id,
      message: `Payment successful for ${planName}. Payment ID: ${razorpay_payment_id}`,
      metadata: { orderId: razorpay_order_id, paymentId: razorpay_payment_id, planName },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
