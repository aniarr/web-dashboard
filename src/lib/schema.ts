import { z } from "zod";

export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["member", "admin"]).default("member").optional(),
});

export const insertReportSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1),
  details: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = Omit<InsertUser, "role"> & { id: string; role: "member" | "admin" };

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = InsertReport & { id: string; content: string; createdAt: string };
