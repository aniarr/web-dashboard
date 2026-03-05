import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Signup() {
    const { register, isLoading } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !name) return;
        await register(email, name, password);
    };

    return (
        <div className="min-h-screen bg-secondary/30 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                <Activity className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-bold tracking-tight">Mr DocGen</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                <Card className="glass-card border-white/50">
                    <CardHeader className="space-y-2 text-center pb-6">
                        <CardTitle className="text-3xl font-extrabold tracking-tight">Create an account</CardTitle>
                        <CardDescription className="text-base">
                            Enter your details below to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 bg-background/50 focus:bg-background transition-colors rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 bg-background/50 focus:bg-background transition-colors rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 bg-background/50 focus:bg-background transition-colors rounded-xl"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group mt-6"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing up..." : "Sign Up"}
                                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center justify-center border-t border-border/50 pt-6 mt-2 pb-8">
                        <p className="text-sm text-muted-foreground">
                            Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
