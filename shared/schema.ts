import { pgTable, text, integer, boolean, timestamp, serial, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  company: text("company"),
  role: text("role").default("member"), // admin, member, viewer
  plan: text("plan").default("starter"), // starter, professional, business, enterprise
  avatarInitials: text("avatar_initials"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").default("draft"), // draft, pending, completed, declined, voided, expired
  senderId: integer("sender_id").notNull(),
  fileName: text("file_name"),
  fileSize: text("file_size"),
  subject: text("subject"),
  message: text("message"),
  expiresAt: timestamp("expires_at"),
  sentAt: timestamp("sent_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  templateId: integer("template_id"),
  reminderFrequency: text("reminder_frequency").default("none"),
  tags: json("tags").$type<string[]>().default([]),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Recipients
export const recipients = pgTable("recipients", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").default("signer"), // signer, cc, approver
  signingOrder: integer("signing_order").default(1),
  status: text("status").default("pending"), // pending, sent, viewed, signed, declined
  authMethod: text("auth_method").default("none"), // none, sms, email
  authPhone: text("auth_phone"),
  signedAt: timestamp("signed_at"),
  viewedAt: timestamp("viewed_at"),
  signingToken: text("signing_token"),
  color: text("color").default("#3b82f6"),
});

export const insertRecipientSchema = createInsertSchema(recipients).omit({ id: true });
export type InsertRecipient = z.infer<typeof insertRecipientSchema>;
export type Recipient = typeof recipients.$inferSelect;

// Document Fields (placed on document)
export const documentFields = pgTable("document_fields", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  recipientId: integer("recipient_id"),
  type: text("type").notNull(), // signature, initials, date, text, checkbox, dropdown, name, company, title
  page: integer("page").default(1),
  x: integer("x").default(0),
  y: integer("y").default(0),
  width: integer("width").default(150),
  height: integer("height").default(40),
  required: boolean("required").default(true),
  label: text("label"),
  defaultValue: text("default_value"),
  value: text("value"),
  options: json("options").$type<string[]>().default([]),
});

export const insertDocumentFieldSchema = createInsertSchema(documentFields).omit({ id: true });
export type InsertDocumentField = z.infer<typeof insertDocumentFieldSchema>;
export type DocumentField = typeof documentFields.$inferSelect;

// Templates
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  creatorId: integer("creator_id").notNull(),
  fileName: text("file_name"),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Contacts
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  organization: text("organization"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Team Members
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  invitedEmail: text("invited_email").notNull(),
  invitedName: text("invited_name").notNull(),
  role: text("role").default("member"), // admin, member, viewer
  status: text("status").default("pending"), // pending, active, removed
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, invitedAt: true });
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Audit Log Events
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id"),
  userId: integer("user_id"),
  recipientId: integer("recipient_id"),
  action: text("action").notNull(), // document_created, document_sent, document_viewed, document_signed, document_completed, document_declined, document_voided
  actorName: text("actor_name"),
  actorEmail: text("actor_email"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: json("metadata").$type<Record<string, string>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // signed, viewed, completed, declined, reminder
  title: text("title").notNull(),
  message: text("message").notNull(),
  documentId: integer("document_id"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
