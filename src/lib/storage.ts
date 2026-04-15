import mongoose from "mongoose";
import type { InsertReport, InsertUser, Report, User } from "@/lib/schema";
import { connectToDatabase } from "@/lib/mongodb";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["member", "admin"], default: "member" },
});

const reportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  details: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
  },
});

reportSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    ret.createdAt = ret.createdAt instanceof Date ? ret.createdAt.toISOString() : ret.createdAt;
    delete ret._id;
    delete ret.__v;
  },
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
const ReportModel = mongoose.models.Report || mongoose.model("Report", reportSchema);

export async function ensureSeedData() {
  await connectToDatabase();

  const existingUsers = await UserModel.find({});
  let memberUser = existingUsers.find((user) => user.email === "member@example.com");

  if (!existingUsers.find((user) => user.email === "admin@example.com")) {
    await new UserModel({
      email: "admin@example.com",
      password: "password",
      name: "Admin User",
      role: "admin",
    }).save();
  }

  if (!memberUser) {
    memberUser = await new UserModel({
      email: "member@example.com",
      password: "password",
      name: "Member User",
      role: "member",
    }).save();
  }

  const existingReports = await ReportModel.find({});
  if (existingReports.length === 0 && memberUser) {
    await ReportModel.insertMany([
      {
        userId: String(memberUser._id),
        title: "Q1 Performance",
        details: "Analyze Q1 sales and marketing performance.",
        content: "This is a mock generated report content based on your details: Analyze Q1 sales and marketing performance.",
      },
      {
        userId: String(memberUser._id),
        title: "Employee Satisfaction",
        details: "Summarize the recent survey results.",
        content: "This is a mock generated report content based on your details: Summarize the recent survey results.",
      },
    ]);
  }
}

export async function getUser(id: string) {
  await connectToDatabase();
  const user = await UserModel.findById(id);
  return user ? (user.toJSON() as User) : null;
}

export async function getUserByEmail(email: string) {
  await connectToDatabase();
  const user = await UserModel.findOne({ email });
  return user ? (user.toJSON() as User) : null;
}

export async function createUser(input: InsertUser) {
  await connectToDatabase();
  const user = new UserModel({
    ...input,
    role: input.role ?? "member",
  });
  await user.save();
  return user.toJSON() as User;
}

export async function getUsers() {
  await connectToDatabase();
  const users = await UserModel.find({});
  return users.map((user) => user.toJSON() as User);
}

export async function getReports() {
  await connectToDatabase();
  const reports = await ReportModel.find({}).sort({ createdAt: -1 });
  return reports.map((report) => report.toJSON() as Report);
}

export async function getReportsByUser(userId: string) {
  await connectToDatabase();
  const reports = await ReportModel.find({ userId }).sort({ createdAt: -1 });
  return reports.map((report) => report.toJSON() as Report);
}

export async function createReport(input: InsertReport) {
  await connectToDatabase();
  const report = new ReportModel({
    ...input,
    content: `Generated comprehensive report based on: "${input.details}".\n\nThis entails a detailed breakdown of the strategic objectives, key performance indicators, and actionable insights derived from the provided context. The automated analysis highlights significant opportunities for growth and potential risk factors to mitigate.`,
  });
  await report.save();
  return report.toJSON() as Report;
}
