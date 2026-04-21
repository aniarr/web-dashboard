"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Check, Zap, Shield, Rocket, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Starter",
    price: 0,
    description: "Perfect for small teams or trial projects.",
    features: ["Up to 10 Reports/mo", "Basic Templates", "1 Admin Seat", "Email Support"],
    icon: Zap,
    color: "blue",
  },
  {
    name: "Professional",
    price: 499,
    description: "The most popular choice for growing organizations.",
    features: ["Unlimited Reports", "Custom Branding", "5 Admin Seats", "Priority Support", "Advanced Analytics"],
    icon: Rocket,
    popular: true,
    color: "indigo",
  },
  {
    name: "Enterprise",
    price: 9999, // Custom logic handled in handleSelect
    description: "Tailored solutions for large institutions.",
    features: ["Everything in Pro", "Bulk User Imports", "Custom Templates", "Dedicated Account Manager", "SSO Integration"],
    icon: Shield,
    color: "slate",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selecting, setSelecting] = useState<string | null>(null);

  const handleSelect = async (plan: typeof plans[0]) => {
    if (!user) return;
    
    setSelecting(plan.name);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pendingPlan", plan.name.toLowerCase());
    }

    // Skip payment for free plan
    if (plan.price === 0) {
      router.push("/setup/create");
      return;
    }

    try {
      // 1. Create Order
      const orderRes = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: plan.price, 
          planName: plan.name 
        }),
      });

      if (!orderRes.ok) throw new Error("Could not create payment order");
      const order = await orderRes.json();

      // 2. Open Razorpay Checkout
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Mr DocGen",
        description: `Subscription: ${plan.name} Plan`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                planName: plan.name
              }),
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            toast({ title: "Payment Successful", description: "Your workspace is ready for setup." });
            router.push("/setup/create");
          } catch (err: any) {
            toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
            setSelecting(null);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#0f172a", // Match your app's slate-900
        },
        modal: {
          ondismiss: function() {
            setSelecting(null);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast({ 
        title: "Payment Initialization Failed", 
        description: error.message, 
        variant: "destructive" 
      });
      setSelecting(null);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-16 max-w-3xl"
      >
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
          Step 1: Choose Your Plan
        </Badge>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Unlock Premium Document Generation</h1>
        <p className="text-xl text-slate-500">Pick a workspace plan to continue. You can always change this later.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`h-full relative overflow-hidden border-none shadow-xl rounded-[2.5rem] transition-all hover:shadow-2xl hover:-translate-y-2 bg-white flex flex-col ${plan.popular ? 'ring-2 ring-primary ring-offset-4' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 right-12 translate-y-[-50%] p-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full px-4 py-2 shadow-lg">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="p-10 pb-4">
                <div className={`h-14 w-14 rounded-2xl bg-${plan.color}-100 flex items-center justify-center text-${plan.color}-600 mb-6`}>
                  <plan.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>
                <CardDescription className="text-slate-500 mt-2 min-h-[40px]">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-10 pt-4 flex-grow">
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black tracking-tighter text-slate-900">
                    {plan.name === "Enterprise" ? "Custom" : `₹${plan.price}`}
                  </span>
                  {plan.name !== "Enterprise" && <span className="text-slate-400 font-medium">/month</span>}
                </div>

                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-slate-600 text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-10 pt-0">
                <Button 
                  onClick={() => handleSelect(plan)}
                  disabled={selecting !== null}
                  className={`w-full h-14 rounded-full font-bold text-lg shadow-lg shadow-slate-200 transition-all active:scale-95 ${plan.popular ? 'bg-primary' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                >
                  {selecting === plan.name ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      {plan.price === 0 ? "Start for Free" : "Select Plan"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <p className="mt-12 text-slate-400 text-sm font-medium">
        Secure payment processing powered by DemoPay. No credit card required for trial.
      </p>
    </div>
  );
}
