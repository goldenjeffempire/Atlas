import { pgTable, text, serial, integer, timestamp, boolean, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema with role enum
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull(),
  role: text("role", { enum: ["admin", "general", "employee"] }).notNull().default("general"),
  // Admin fields
  adminTitle: text("admin_title"),
  adminDepartment: text("admin_department"),
  // General user fields
  jobTitle: text("job_title"),
  // Employee fields
  employeeId: text("employee_id"),
  department: text("department"),
  // Common fields
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Workspace schema
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  type: text("type", { enum: ["desk", "meeting_room", "collaborative_space", "private_office", "focus_pod"] }).notNull(),
  imageUrl: text("image_url").notNull(),
  features: jsonb("features").notNull(),
  capacity: integer("capacity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({
  id: true,
  createdAt: true,
});

// Booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

// Types
export type Role = "admin" | "general" | "employee";
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type LoginData = Pick<InsertUser, "email" | "password">;

// Extended schemas for frontend validation
export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
  // Make these fields optional since they depend on role
  phoneNumber: z.string().optional(),
  // Admin fields
  adminTitle: z.string().optional(),
  adminDepartment: z.string().optional(),
  // General fields
  jobTitle: z.string().optional(),
  // Employee fields
  employeeId: z.string().optional(),
  department: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterUserData = z.infer<typeof registerUserSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [bookings.workspaceId],
    references: [workspaces.id],
  }),
}));
