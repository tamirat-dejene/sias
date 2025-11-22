import { pgTable, serial, text, timestamp, boolean, json, integer, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["student", "instructor", "department_head", "registrar", "admin"]);
export const securityLevelEnum = pgEnum("security_level", ["public", "internal", "confidential", "restricted"]);

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  role: roleEnum("role").default("student").notNull(),
  department: text("department"),
  attributes: json("attributes"), // For ABAC
  securityLevel: securityLevelEnum("security_level").default("public").notNull(), // For MAC
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Academic Entities

export const students = pgTable("student", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  year: integer("year").notNull(),
  enrollmentStatus: text("enrollment_status").notNull(),
});

export const instructors = pgTable("instructor", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
});

export const courses = pgTable("course", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  instructorId: integer("instructor_id").references(() => instructors.id),
  securityLevel: securityLevelEnum("security_level").default("internal").notNull(),
});

export const enrollments = pgTable("enrollment", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  semester: text("semester").notNull(),
});

export const grades = pgTable("grade", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull().references(() => enrollments.id),
  grade: text("grade"), // A, B, C...
  updatedBy: text("updated_by").references(() => users.id),
  securityLevel: securityLevelEnum("security_level").default("confidential").notNull(),
});

// Access Control

export const dacShares = pgTable("dac_share", {
  id: serial("id").primaryKey(),
  resourceType: text("resource_type").notNull(), // 'grade_report', 'transcript'
  resourceId: integer("resource_id").notNull(),
  ownerId: text("owner_id").notNull().references(() => users.id),
  sharedWithId: text("shared_with_id").notNull().references(() => users.id),
  permission: text("permission").notNull(), // 'read', 'write'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  details: json("details"),
});
