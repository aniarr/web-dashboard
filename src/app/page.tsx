"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, Globe, GraduationCap, Heart, Lightbulb, Mail, MapPin, Phone, Rocket, Send, Shield, Zap } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const inquiryPaths = [
  { value: "general", label: "General Inquiry" },
  { value: "sales", label: "Sales & Pricing" },
  { value: "support", label: "Technical Support" },
  { value: "partnership", label: "Partnership Opportunities" },
  { value: "feedback", label: "Product Feedback" },
  { value: "other", label: "Other" },
];

export default function HomePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    inquiryPath: "",
    subject: "",
    message: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Message sent!",
      description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      variant: "default",
    });
    setForm({ name: "", email: "", inquiryPath: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden pb-32 pt-24">
          <div className="absolute inset-0 z-0">
            <div className="absolute right-0 top-0 h-[600px] w-1/2 translate-x-1/3 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-[600px] w-1/2 -translate-x-1/3 translate-y-1/3 rounded-full bg-blue-500/5 blur-3xl" />
          </div>

          <div className="container relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary" />
              Introducing Mr DocGen Reports 2.0
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-foreground md:text-7xl"
            >
              Professional Insights,
              <br />
              <span className="text-gradient">Generated in Seconds.</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground"
            >
              Transform your raw event data into polished reports automatically. Save hours of manual compilation and focus on what matters.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/login">
                <Button size="lg" className="h-14 rounded-full px-8 text-base shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-primary/40">
                  Start Creating Reports
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="h-14 rounded-full px-8 text-base transition-colors hover:bg-secondary">
                  Create Account
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section id="about" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">About Mr DocGen</h2>
              <p className="text-lg text-muted-foreground">Empowering institutions with intelligent reporting solutions.</p>
            </div>

            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="flex flex-col justify-center space-y-6"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary w-fit">
                  <GraduationCap className="h-4 w-4" />
                  A Product of Inovus Labs IEDC
                </div>
                <h3 className="text-2xl font-bold md:text-3xl">
                  Built at the intersection of innovation and education
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Mr DocGen is a flagship product developed by <strong>Inovus Labs IEDC</strong> — fostering entrepreneurship and innovation in academic institutions. We believe that powerful reporting tools should be accessible to everyone, from student organizations to enterprise teams.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our mission is to transform how institutions handle documentation, making report generation faster, smarter, and more reliable. By leveraging cutting-edge technology, we help organizations save time and focus on what truly matters.
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <a
                    href="https://inovuslabs.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Visit Inovus Labs
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-6"
              >
                {[
                  { icon: Rocket, title: "Innovation First", desc: "Built with modern tech stack for scalability" },
                  { icon: Lightbulb, title: "Education Driven", desc: "Designed for academic institutions" },
                  { icon: Shield, title: "Secure & Reliable", desc: "Enterprise-grade security standards" },
                  { icon: Heart, title: "Community Focused", desc: "Open to feedback and improvements" },
                ].map((item, index) => (
                  <div key={item.title} className="rounded-xl border bg-card p-6 hover-elevate">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h4 className="mb-2 font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-secondary/30 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Everything you need to report better</h2>
              <p className="text-lg text-muted-foreground">Powerful features wrapped in a beautifully simple interface designed for modern teams.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                { icon: Zap, title: "Lightning Fast", desc: "Generate comprehensive documents instantly without the wait." },
                { icon: Shield, title: "Enterprise Security", desc: "Role-aware access and server-side session handling inside one app." },
                { icon: BarChart3, title: "Actionable Insights", desc: "Turn form inputs into structured reports your team can share quickly." },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="hover-elevate rounded-2xl border bg-card p-8 shadow-lg shadow-black/5"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
              <p className="text-lg text-muted-foreground">Choose the perfect plan for your team&apos;s reporting needs.</p>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
              {[
                { name: "Basic", price: "$29", desc: "Perfect for individuals and small teams.", features: ["50 Reports/month", "Standard Templates", "Email Support", "7-day History"] },
                { name: "Pro", price: "$99", desc: "For growing organizations needing more power.", features: ["Unlimited Reports", "Custom Branding", "Priority Support", "Unlimited History", "Advanced Analytics"], popular: true },
                { name: "Enterprise", price: "Custom", desc: "Dedicated solutions for large enterprises.", features: ["Everything in Pro", "Dedicated Account Manager", "SSO/SAML", "Custom Integrations", "SLA Guarantee"] },
              ].map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex flex-col rounded-3xl border bg-card p-8 ${plan.popular ? "z-10 scale-105 shadow-2xl shadow-primary/10 ring-2 ring-primary" : "shadow-lg hover-elevate"}`}
                >
                  {plan.popular && (
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                  <p className="mb-6 h-12 text-muted-foreground">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
                  </div>

                  <ul className="mb-8 flex-1 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                        <span className="font-medium text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button variant={plan.popular ? "default" : "outline"} className="w-full rounded-xl py-6 text-base">
                    {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="mx-auto mb-16 max-w-3xl text-center"
            >
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Get in Touch</h2>
              <p className="text-lg text-muted-foreground">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Office Address</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Inovus Labs IEDC<br />
                          Kristu Jyoti College of Management & Technology<br />
                          Chethipuzha P.O, Changanacherry, Kottayam, Kerala, India.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Email Us</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          <a href="mailto:inovuslabs@kjcmt.ac.in" className="hover:text-primary transition-colors">inovuslabs@kjcmt.ac.in</a><br />
                          <a href="mailto:contact.inovus@gmail.com" className="hover:text-primary transition-colors">contact.inovus@gmail.com</a><br />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Call Us</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          <a href="tel:+919188550674" className="hover:text-primary transition-colors">+91 9188550674</a><br />
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Send us a Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inquiryPath">Choose your Path *</Label>
                        <select
                          id="inquiryPath"
                          name="inquiryPath"
                          value={form.inquiryPath}
                          onChange={handleChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        >
                          <option value="">Select inquiry type...</option>
                          {inquiryPaths.map((path) => (
                            <option key={path.value} value={path.value}>{path.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Tell us more about your inquiry..."
                          className="min-h-[100px]"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                        {loading ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
