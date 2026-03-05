import { z } from "zod";

export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
  role: z.enum(['member', 'admin']).default('member').optional(),
});

export const insertReportSchema = z.object({
  userId: z.string(),
  title: z.string(),
  details: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = Omit<InsertUser, 'role'> & { id: string, role: string };

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = InsertReport & { id: string, content: string, createdAt: Date };

