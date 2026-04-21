import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import type {
  AuditLog,
  InsertOrganization,
  InsertReport,
  InsertUser,
  Organization,
  Report,
  SiteSettings,
  SuperAdminAnalytics,
  SuperAdminStats,
  User,
} from "@/lib/schema";
import { connectToDatabase } from "@/lib/mongodb";
import { generateReportAI } from "@/lib/gemini";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["member", "admin", "super_admin"], default: "member" },
  organizationId: { type: String, default: undefined },
  organizationIds: { type: [String], default: [] },
  adminOrganizationIds: { type: [String], default: [] },
  currentSessionId: { type: String, default: undefined },
});

const reportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  details: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  headerTitle: { type: String, default: "" },
  headerSubtitle: { type: String, default: "" },
  footerText: { type: String, default: "" },
  headerImage: { type: String, default: "" },
  footerImage: { type: String, default: "" },
  headerImagePublicId: { type: String, default: "" },
  footerImagePublicId: { type: String, default: "" },
  plan: { type: String, default: "starter" },
  signatureLeftLabel: { type: String, default: "Event Coordinator" },
  signatureRightLabel: { type: String, default: "Head of Department" },
  signatureRightName: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const siteSettingsSchema = new mongoose.Schema({
  platformName: { type: String, required: true },
  supportEmail: { type: String, required: true },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: "The platform is currently in maintenance mode." },
  allowPublicSignup: { type: Boolean, default: true },
  defaultUserRole: { type: String, enum: ["member", "admin", "super_admin"], default: "member" },
  requireOrganizationForUsers: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
});

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 600 } }, // Expire after 10 minutes
});

const auditLogSchema = new mongoose.Schema({
  actorUserId: { type: String, default: undefined },
  actorEmail: { type: String, default: undefined },
  actorRole: { type: String, enum: ["member", "admin", "super_admin"], default: undefined },
  action: { type: String, required: true },
  entityType: { type: String, enum: ["user", "organization", "site_settings", "auth"], required: true },
  entityId: { type: String, default: undefined },
  message: { type: String, required: true },
  organizationId: { type: String, default: undefined },
  metadata: { type: mongoose.Schema.Types.Mixed, default: undefined },
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

organizationSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    ret.createdAt = ret.createdAt instanceof Date ? ret.createdAt.toISOString() : ret.createdAt;
    delete ret._id;
    delete ret.__v;
  },
});

siteSettingsSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    ret.updatedAt = ret.updatedAt instanceof Date ? ret.updatedAt.toISOString() : ret.updatedAt;
    delete ret._id;
    delete ret.__v;
  },
});

auditLogSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    ret.createdAt = ret.createdAt instanceof Date ? ret.createdAt.toISOString() : ret.createdAt;
    delete ret._id;
    delete ret.__v;
  },
});

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export const ReportModel = mongoose.models.Report || mongoose.model("Report", reportSchema);
export const OrganizationModel = mongoose.models.Organization || mongoose.model("Organization", organizationSchema);
export const SiteSettingsModel = mongoose.models.SiteSettings || mongoose.model("SiteSettings", siteSettingsSchema);
export const OtpModel = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

export async function ensureSeedData() {
  await connectToDatabase();

  const existingSettings = await SiteSettingsModel.findOne({});
  if (!existingSettings) {
    await new SiteSettingsModel({
      platformName: "Mr DocGen",
      supportEmail: "support@inovuslabs.org",
      maintenanceMode: false,
      allowPublicSignup: true,
      defaultUserRole: "member",
      requireOrganizationForUsers: false,
    }).save();
  }

  const existingUsers = await UserModel.find({});
  const hasSuperAdmin = existingUsers.some((u) => u.role === "super_admin");

  if (!hasSuperAdmin) {
    const hashedPassword = await bcrypt.hash("123456789", 10);
    await new UserModel({
      email: "superadmin@gmail.com",
      password: hashedPassword,
      name: "Super Admin",
      role: "super_admin",
      organizationId: undefined,
    }).save();
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
  const hashedPassword = await bcrypt.hash(input.password, 10);
  
  const organizationIds = input.organizationIds || [];
  const adminOrganizationIds = input.adminOrganizationIds || [];
  
  if (input.organizationId && !organizationIds.includes(input.organizationId)) {
    organizationIds.push(input.organizationId);
  }

  const user = new UserModel({
    ...input,
    password: hashedPassword,
    role: input.role ?? "member",
    organizationIds,
    adminOrganizationIds,
  });
  await user.save();
  return user.toJSON() as User;
}

export async function getUsers() {
  await connectToDatabase();
  const users = await UserModel.find({});
  return users.map((user) => user.toJSON() as User);
}

export async function getScopedUsersForAdmin(adminUser: User) {
  await connectToDatabase();
  const query =
    adminUser.role === "super_admin"
      ? {}
      : {
          role: { $ne: "super_admin" },
          ...(adminUser.organizationId ? { organizationId: adminUser.organizationId } : { organizationId: { $exists: false } }),
        };
  const users = await UserModel.find(query);
  return users.map((user) => user.toJSON() as User);
}

export async function updateUser(id: string, input: Partial<InsertUser>) {
  await connectToDatabase();
  const updateData = { ...input };
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }
  const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
  return user ? (user.toJSON() as User) : null;
}

export async function deleteUser(id: string) {
  await connectToDatabase();
  await UserModel.findByIdAndDelete(id);
}

export async function getReports(organizationId?: string) {
  await connectToDatabase();
  const userQuery = organizationId ? { organizationId } : {};
  const usersInOrg = await UserModel.find(userQuery);
  const userIdsInOrg = usersInOrg.map(u => String(u._id));
  
  const reports = await ReportModel.find({ userId: { $in: userIdsInOrg } }).sort({ createdAt: -1 });
  const userMap = new Map(usersInOrg.map((u) => [String(u._id), u.name]));
  
  return reports.map((report) => {
    const json = report.toJSON() as Report;
    return { ...json, userName: userMap.get(json.userId) || "Unknown User" };
  });
}

export async function getReportsByUser(userId: string) {
  await connectToDatabase();
  const [reports, user] = await Promise.all([
    ReportModel.find({ userId }).sort({ createdAt: -1 }),
    UserModel.findById(userId),
  ]);
  const userName = user ? user.name : "Unknown User";
  return reports.map((report) => {
    const json = report.toJSON() as Report;
    return { ...json, userName };
  });
}

export async function getScopedReportsForAdmin(adminUser: User) {
  await connectToDatabase();

  if (adminUser.role === "super_admin") {
    return getReports();
  }

  const query = adminUser.organizationId
    ? { organizationId: adminUser.organizationId, role: { $ne: "super_admin" } }
    : { organizationId: { $exists: false }, role: { $ne: "super_admin" } };

  const users = await UserModel.find(query);
  const userMap = new Map(users.map((u) => [String(u._id), u.name]));
  const userIds = Array.from(userMap.keys());
  
  const reports = await ReportModel.find({ userId: { $in: userIds } }).sort({ createdAt: -1 });
  return reports.map((report) => {
    const json = report.toJSON() as Report;
    return {
      ...json,
      userName: userMap.get(json.userId) || "Unknown User",
    };
  });
}

export async function generateReportContent(details: string) {
  try {
    const data = JSON.parse(details);
    const context = `Event Title: ${data.title}, Date: ${data.date}, Organizing Team: ${data.department}, Mode: ${data.mode}, Participants: ${data.students} students and ${data.faculties} faculties, Coordinator: ${data.coordinator}. Additional Keywords: ${data.report}`;
    return await generateReportAI(context);
  } catch {
    return await generateReportAI(details);
  }
}

export async function deleteReport(id: string) {
  await connectToDatabase();
  await ReportModel.findByIdAndDelete(id);
}

export async function updateReport(id: string, input: Partial<InsertReport>) {
  await connectToDatabase();
  
  let updateData: any = { ...input };
  
  if (input.details) {
    const content = await generateReportContent(input.details);
    updateData.content = JSON.stringify(content);
  }
  
  const report = await ReportModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );
  
  if (!report) return null;
  return report.toJSON() as Report;
}

export async function createReport(input: InsertReport) {
  await connectToDatabase();
  const content = await generateReportContent(input.details);
  const report = new ReportModel({
    ...input,
    content: JSON.stringify(content),
  });
  await report.save();
  return report.toJSON() as Report;
}

export async function previewReport(details: string) {
  return await generateReportContent(details);
}

export async function getOrganizationsByIds(ids: string[]) {
  await connectToDatabase();
  const organizations = await OrganizationModel.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
  return organizations.map((organization) => organization.toJSON() as Organization);
}

export async function getOrganizations() {
  await connectToDatabase();
  const organizations = await OrganizationModel.find({}).sort({ createdAt: -1 });
  return organizations.map((organization) => organization.toJSON() as Organization);
}

export async function getOrganizationsWithStats() {
  await connectToDatabase();
  const orgs = await OrganizationModel.find({}).sort({ createdAt: -1 });
  
  // Aggregate counts to avoid N+1 queries
  const userStats = await UserModel.aggregate([
    { $group: { _id: "$organizationId", count: { $sum: 1 } } }
  ]);
  
  // For reports, we need to map them through users
  const reports = await ReportModel.find({});
  const users = await UserModel.find({});
  const userToOrg = new Map(users.map(u => [String(u._id), u.organizationId]));
  
  const reportStats = new Map<string, number>();
  reports.forEach(r => {
    const orgId = userToOrg.get(r.userId);
    if (orgId) {
      reportStats.set(orgId, (reportStats.get(orgId) || 0) + 1);
    }
  });

  const userStatsMap = new Map(userStats.map(s => [String(s._id), s.count]));

  return orgs.map(org => {
    const json = org.toJSON() as Organization;
    return {
      ...json,
      memberCount: userStatsMap.get(json.id) || 0,
      reportCount: reportStats.get(json.id) || 0
    };
  });
}

export async function createOrganization(input: InsertOrganization) {
  await connectToDatabase();
  const organization = new OrganizationModel({
    ...input,
  });
  await organization.save();
  return organization.toJSON() as Organization;
}

export async function updateOrganization(id: string, input: Partial<InsertOrganization>) {
  await connectToDatabase();
  const organization = await OrganizationModel.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true }
  );
  if (!organization) return null;
  return organization.toJSON() as Organization;
}

export async function getOrganizationById(id: string) {
  await connectToDatabase();
  const organization = await OrganizationModel.findById(id);
  if (!organization) return null;
  return organization.toJSON() as Organization;
}

export async function deleteOrganization(id: string) {
  await connectToDatabase();
  await OrganizationModel.findByIdAndDelete(id);
  await UserModel.updateMany({ organizationId: id }, { $unset: { organizationId: "" } });
}

export async function getOrganizationStats(organizationId: string) {
  await connectToDatabase();
  const [memberCount, reportCount] = await Promise.all([
    UserModel.countDocuments({ organizationId }),
    ReportModel.countDocuments({ 
        userId: { 
            $in: await UserModel.find({ organizationId }).distinct("_id") 
        } 
    }),
  ]);

  return { memberCount, reportCount };
}

export async function getSuperAdminStats(): Promise<SuperAdminStats> {
  await connectToDatabase();
  const [totalUsers, totalOrganizations, totalReports, totalMembers, totalAdmins, totalSuperAdmins, activeOrganizations] =
    await Promise.all([
      UserModel.countDocuments({}),
      OrganizationModel.countDocuments({}),
      ReportModel.countDocuments({}),
      UserModel.countDocuments({ role: "member" }),
      UserModel.countDocuments({ role: "admin" }),
      UserModel.countDocuments({ role: "super_admin" }),
      OrganizationModel.countDocuments({ isActive: true }),
    ]);

  return {
    totalUsers,
    totalOrganizations,
    totalReports,
    totalMembers,
    totalAdmins,
    totalSuperAdmins,
    activeOrganizations,
  };
}

export async function getSiteSettings() {
  await connectToDatabase();
  const settings = await SiteSettingsModel.findOne({});
  return settings ? (settings.toJSON() as SiteSettings) : null;
}

export async function updateSiteSettings(input: Partial<Omit<SiteSettings, "id" | "updatedAt">>) {
  await connectToDatabase();
  const settings = await SiteSettingsModel.findOneAndUpdate(
    {},
    { ...input, updatedAt: new Date() },
    { new: true, upsert: true },
  );
  return settings.toJSON() as SiteSettings;
}

export async function createAuditLog(input: Omit<AuditLog, "id" | "createdAt">) {
  await connectToDatabase();
  const log = new AuditLogModel(input);
  await log.save();
  return log.toJSON() as AuditLog;
}

export async function getAuditLogs(limit = 100, organizationId?: string, userId?: string) {
  await connectToDatabase();
  const query: any = {};
  if (organizationId) query.organizationId = organizationId;
  if (userId) query.actorUserId = userId;
  
  const logs = await AuditLogModel.find(query).sort({ createdAt: -1 }).limit(limit);
  return logs.map((log) => log.toJSON() as AuditLog);
}

export async function getSuperAdminAnalytics(): Promise<SuperAdminAnalytics> {
  await connectToDatabase();

  const [roleCounts, orgStatusCounts, timelineRaw] = await Promise.all([
    UserModel.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    OrganizationModel.aggregate([{ $group: { _id: "$isActive", count: { $sum: 1 } } }]),
    ReportModel.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    roleBreakdown: roleCounts.map((entry) => ({ name: String(entry._id), value: Number(entry.count) })),
    organizationStatus: orgStatusCounts.map((entry) => ({
      name: entry._id ? "active" : "inactive",
      value: Number(entry.count),
    })),
    reportsTimeline: timelineRaw.map((entry) => ({ date: String(entry._id), reports: Number(entry.count) })),
  };
}
