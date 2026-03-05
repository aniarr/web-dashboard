import mongoose from "mongoose";
import { type User, type InsertUser, type Report, type InsertReport } from "@shared/schema";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: "member" },
});

const reportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  details: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Configure schemas to return `id` and omit `_id` and `__v` for frontend compatibility
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

reportSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export const ReportModel = mongoose.models.Report || mongoose.model("Report", reportSchema);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getReports(): Promise<Report[]>;
  getReportsByUser(userId: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  getUsers(): Promise<User[]>;
}

export class MongoStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user ? user.toJSON() as User : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    return user ? user.toJSON() as User : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = new UserModel({
      ...insertUser,
      role: insertUser.role ?? 'member'
    });
    await user.save();
    return user.toJSON() as User;
  }

  async getUsers(): Promise<User[]> {
    const users = await UserModel.find({});
    return users.map(user => user.toJSON() as User);
  }

  async getReports(): Promise<Report[]> {
    const reports = await ReportModel.find({});
    return reports.map(r => r.toJSON() as Report);
  }

  async getReportsByUser(userId: string): Promise<Report[]> {
    const reports = await ReportModel.find({ userId });
    return reports.map(r => r.toJSON() as Report);
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const report = new ReportModel({
      ...insertReport,
      content: "This is a mock generated report content based on your details: " + insertReport.details,
    });
    await report.save();
    return report.toJSON() as Report;
  }
}

export const storage = new MongoStorage();