"use client";

import { useCallback } from "react";
import { apiRequest } from "@/lib/http";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpay() {
  const { toast } = useToast();

  const loadScript = useCallback(() => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const initiatePayment = useCallback(async (amount: number, planName: string, onSuccess?: (res: any) => void) => {
    const isLoaded = await loadScript();

    if (!isLoaded) {
      toast({
        title: "Payment Error",
        description: "Razorpay SDK failed to load. Are you online?",
        variant: "destructive",
      });
      return;
    }

    try {
      const order = await apiRequest<any>("/api/payments/razorpay/order", {
        method: "POST",
        body: JSON.stringify({ amount, planName }),
      });

      const options = {
        key: order.key || "rzp_test_placeholder",
        amount: order.amount,
        currency: order.currency,
        name: "DocGen",
        description: `Subscription: ${planName}`,
        order_id: order.id,
        handler: function (response: any) {
          toast({
            title: "Payment Successful",
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });
          if (onSuccess) onSuccess(response);
        },
        prefill: {
          name: "", // Can be filled from auth user
          email: "",
        },
        theme: {
          color: "#0F172A", // Matching our slate-900 look
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast({
        title: "Configuration Needed",
        description: "Payment system is setup but needs valid API keys to function.",
        variant: "destructive",
      });
    }
  }, [loadScript, toast]);

  return { initiatePayment };
}
