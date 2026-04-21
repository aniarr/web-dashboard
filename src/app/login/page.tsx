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

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => setSettings(null));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;

    try {
      await login(email, password);
      const next = new URLSearchParams(window.location.search).get("next");
      if (next) {
        window.location.href = next;
      }
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Unable to sign in",
        variant: "destructive",
      });
    }
  };

  const isMaintenanceMode = settings?.maintenanceMode ?? false;

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
            <CardTitle className="text-3xl font-extrabold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-base">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                <div className="flex justify-end">
                  <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
                </div>
              </div>
              <Button type="submit" className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base shadow-md transition-all hover:shadow-lg" disabled={isLoading || isMaintenanceMode}>
                {isMaintenanceMode ? "Maintenance Mode" : isLoading ? "Signing in..." : "Sign In"}
                {!isMaintenanceMode && !isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="mt-2 flex flex-col items-center justify-center border-t border-border/50 pb-8 pt-6">
            {!isMaintenanceMode && (
              <>
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account? <Link href="/signup" className="font-semibold text-primary hover:underline">Sign up</Link>
                </p>
                <p className="mt-4 max-w-xs text-center text-xs text-muted-foreground">
                  Demo accounts: `admin@example.com` / `password` and `member@example.com` / `password`.
                </p>
              </>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
