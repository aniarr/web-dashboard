"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, ArrowRight, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export default function SignupPage() {
  const { register, isLoading } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const plan = searchParams?.get("plan");
  
  useEffect(() => {
    if (plan) {
      sessionStorage.setItem("pendingPlan", plan);
    }
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => setSettings(null));
  }, [plan]);

  const isMaintenanceMode = settings?.maintenanceMode ?? false;

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !name || !password) return;

    if (password !== confirmPassword) {
      toast({
        title: "Passwords mismatch",
        description: "The passwords you entered do not match.",
        variant: "destructive",
      });
      return;
    }

    setSendingOtp(true);
    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP");

      setStep(2);
      setOtpSent(true);
      toast({
        title: "Verification code sent",
        description: `We've sent a 6-digit code to ${email}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step === 1) {
      handleSendOtp(event);
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      toast({ title: "Invalid code", description: "Please enter the 6-digit verification code.", variant: "destructive" });
      return;
    }

    try {
      await register(email, name, password, otpCode);
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error?.message || "Unable to create your account",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-secondary/30 p-4">
      {isMaintenanceMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-500/90 px-4 py-3 text-sm font-medium text-amber-950 backdrop-blur-sm"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>{settings?.maintenanceMessage || "The platform is currently in maintenance mode."}</span>
        </motion.div>
      )}
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-400/10 blur-[100px]" />

      <Link href="/" className="group absolute left-8 top-8 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
        <Activity className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
        <span className="font-bold tracking-tight">Mr DocGen</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="z-10 w-full max-w-md"
      >
        <Card className="glass-card border-white/50">
          <CardHeader className="space-y-2 pb-6 text-center">
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              {step === 1 ? "Create an account" : "Verify Email"}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 1 
                ? "Enter your details below to get started" 
                : `Enter the 6-digit code sent to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(event) => setName(event.target.value)} className="h-12 rounded-xl bg-background/50 transition-colors focus:bg-background" required disabled={isMaintenanceMode} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-xl bg-background/50 transition-colors focus:bg-background" required disabled={isMaintenanceMode} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={(event) => setPassword(event.target.value)} 
                        className="h-12 rounded-xl bg-background/50 pr-12 transition-colors focus:bg-background" 
                        required 
                        disabled={isMaintenanceMode} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground focus:outline-none"
                        disabled={isMaintenanceMode}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {/* Password Requirements Checklist */}
                    {password && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-secondary/50 p-3 text-[11px]"
                      >
                        {[
                          { label: "8+ Characters", met: password.length >= 8 },
                          { label: "Uppercase", met: /[A-Z]/.test(password) },
                          { label: "Lowercase", met: /[a-z]/.test(password) },
                          { label: "Number", met: /[0-9]/.test(password) },
                          { label: "Special Char", met: /[^A-Za-z0-9]/.test(password) },
                        ].map((req) => (
                          <div key={req.label} className="flex items-center gap-1.5">
                            <div className={`h-1.5 w-1.5 rounded-full transition-colors ${req.met ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/30"}`} />
                            <span className={req.met ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Confirm Password Field */}
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type={showPassword ? "text" : "password"} 
                        value={confirmPassword} 
                        onChange={(event) => setConfirmPassword(event.target.value)} 
                        className={`h-12 rounded-xl bg-background/50 transition-all focus:bg-background ${
                          confirmPassword && password !== confirmPassword ? "border-destructive ring-destructive/20" : 
                          confirmPassword && password === confirmPassword ? "border-emerald-500 ring-emerald-500/20" : ""
                        }`} 
                        placeholder="Re-enter password"
                        required 
                        disabled={isMaintenanceMode} 
                      />
                      {confirmPassword && (
                        <p className={`text-[10px] font-medium transition-colors ${password === confirmPassword ? "text-emerald-600" : "text-destructive"}`}>
                          {password === confirmPassword ? "✓ Passwords match" : "✕ Passwords do not match"}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base shadow-md transition-all hover:shadow-lg" disabled={sendingOtp || isMaintenanceMode}>
                    {sendingOtp ? "Sending Code..." : "Send Verification Code"}
                    {!sendingOtp && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input 
                      id="otp" 
                      type="text" 
                      placeholder="000000" 
                      maxLength={6} 
                      value={otpCode} 
                      onChange={(event) => setOtpCode(event.target.value.replace(/[^0-9]/g, ""))} 
                      className="h-14 rounded-xl bg-background/50 text-center text-2xl font-bold tracking-[1em] transition-colors focus:bg-background" 
                      required 
                    />
                    <p className="text-center text-xs text-muted-foreground pt-1">
                      Didn&apos;t receive the code? <button type="button" onClick={handleSendOtp} className="text-primary hover:underline font-medium">Resend</button>
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="h-12 flex-1 rounded-xl" onClick={() => setStep(1)} disabled={isLoading}>
                      Back
                    </Button>
                    <Button type="submit" className="h-12 flex-[2] rounded-xl text-base shadow-md" disabled={isLoading}>
                      {isLoading ? "Verifying..." : "Create Account"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>
          </CardContent>
          <CardFooter className="mt-2 flex flex-col items-center justify-center border-t border-border/50 pb-8 pt-6">
            {!isMaintenanceMode && step === 1 && (
              <p className="text-sm text-muted-foreground">
                Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
              </p>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
