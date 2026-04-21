import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { amount, planName } = await request.json();

    // Amount should be in paise (e.g., ₹499 = 49900 paise)
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user.id,
        userEmail: user.email,
        planName,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ 
      id: order.id, 
      amount: order.amount, 
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID 
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ message: "Could not create payment order" }, { status: 500 });
  }
}
