import { pgTable, text, serial, integer, timestamp, boolean, jsonb, primaryKey, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema with role enum
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull(),
  role: text("role", { enum: ["admin", "general", "employee", "learner"] }).notNull().default("general"),
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
  avatarUrl: text("avatar_url"),
  preferences: jsonb("preferences"),
  // Stripe fields for payment integration
  stripeCustomerId: text("stripe_customer_id"),
  // Google Calendar integration
  googleCalendarToken: text("google_calendar_token"),
  // Account status
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  stripeCustomerId: true,
  googleCalendarToken: true,
  avatarUrl: true,
  preferences: true,
  isActive: true,
});

// Workspace schema
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  type: text("type", { enum: ["desk", "meeting_room", "collaborative_space", "private_office", "focus_pod", "virtual_conference", "phone_booth"] }).notNull(),
  imageUrl: text("image_url").notNull(),
  features: jsonb("features").notNull(),
  capacity: integer("capacity").notNull().default(1),
  floorPlan: text("floor_plan"),
  description: text("description"),
  hourlyRate: integer("hourly_rate"), // In cents for Stripe integration
  availability: jsonb("availability"), // Operating hours or special availability rules
  isActive: boolean("is_active").notNull().default(true),
  // QR code for check-in
  checkInCode: text("check_in_code"),
  // Integration IDs
  openingTime: text("opening_time").default("09:00"),
  closingTime: text("closing_time").default("17:00"),
  zoomRoomId: text("zoom_room_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  checkInCode: true,
  zoomRoomId: true,
});

// Booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "cancelled", "checked_in", "completed"] }).notNull().default("pending"),
  title: text("title"),
  description: text("description"),
  participants: jsonb("participants"), // Additional participants
  // Payment related fields
  paymentStatus: text("payment_status", { enum: ["unpaid", "paid", "refunded"] }),
  paymentId: text("payment_id"), // Stripe payment ID
  amount: integer("amount"), // Amount in cents
  // Calendar integration
  googleCalendarEventId: text("google_calendar_event_id"),
  // Check-in/check-out times
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  // For recurrences
  recurringBookingId: integer("recurring_booking_id"),
  recurringPattern: text("recurring_pattern"), // e.g., "weekly", "daily"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  checkInTime: true,
  checkOutTime: true,
  googleCalendarEventId: true,
  paymentId: true,
  recurringBookingId: true,
});

// Types
export type Role = "admin" | "general" | "employee" | "learner";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "checked_in" | "completed";
export type NotificationType = "booking_confirmation" | "booking_reminder" | "booking_cancellation" | "admin_message" | "system_alert";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type MetricType = "daily_bookings" | "workspace_utilization" | "user_activity" | "revenue";
// Organization schema
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color"),
  brandingSettings: jsonb("branding_settings"),
  policies: jsonb("policies"),
  features: jsonb("features"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Location schema
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  type: text("type", { enum: ["city", "building", "floor", "campus", "region"] }).notNull(),
  parentLocationId: integer("parent_location_id").references(() => locations.id),
  address: text("address"),
  coordinates: jsonb("coordinates"), // For map integration
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type EntityType = "user" | "workspace" | "booking" | "system" | "organization" | "location";

export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type AnalyticsMetric = typeof analytics.$inferSelect;

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

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type", { enum: ["booking_confirmation", "booking_reminder", "booking_cancellation", "admin_message", "system_alert"] }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  relatedBookingId: integer("related_booking_id").references(() => bookings.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Analytics table for storing aggregated metrics
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  metricDate: timestamp("metric_date").notNull(),
  metricType: text("metric_type", { enum: ["daily_bookings", "workspace_utilization", "user_activity", "revenue"] }).notNull(),
  metricValue: jsonb("metric_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity logs for audit trail
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type", { enum: ["user", "workspace", "booking", "system"] }).notNull(),
  entityId: integer("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  notifications: many(notifications),
  activityLogs: many(activityLogs),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [bookings.workspaceId],
    references: [workspaces.id],
  }),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [notifications.relatedBookingId],
    references: [bookings.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));
