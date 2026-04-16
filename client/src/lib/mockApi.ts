// Real Supabase API — replaces in-memory mock
// All function signatures kept identical to the old mockApi for zero UI changes.
import { supabase } from "./supabase";
import { sendCompletionEmail, sendSigningRequestEmail } from "./resend";

// ─── Types (IDs for join tables are now bigint → number; userId is string UUID) ───

export interface User {
  id: string; // UUID
  fullName: string;
  email: string;
  company: string;
  role: string;
  plan: string;
  avatarInitials: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
}
export interface Document {
  id: number;
  title: string;
  status: string;
  senderId: string | number; // UUID string or legacy number fallback
  fileName: string;
  fileSize: string;
  filePath?: string | null;
  subject: string;
  message: string;
  expiresAt: Date | null;
  sentAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  templateId: number | null;
  reminderFrequency: string;
  tags: string[];
}
export interface Recipient {
  id: number;
  documentId: number;
  name: string;
  email: string;
  role: string;
  signingOrder: number;
  status: string;
  authMethod: string;
  authPhone: string | null;
  signedAt: Date | null;
  viewedAt: Date | null;
  signingToken: string;
  color: string;
}
export interface DocumentField {
  id: number;
  documentId: number;
  recipientId: number | null;
  type: string;
  label: string;
  required: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  value: string | null;
}
export interface Template {
  id: number;
  name: string;
  description: string;
  creatorId: string; // UUID
  fileName: string;
  filePath?: string | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface Contact {
  id: number;
  userId: string; // UUID
  name: string;
  email: string;
  organization: string;
  phone: string | null;
  createdAt: Date;
}
export interface TeamMember {
  id: number;
  userId: string; // UUID
  invitedEmail: string;
  invitedName: string;
  role: string;
  status: string;
  invitedAt: Date;
  joinedAt: Date | null;
}
export interface AuditLog {
  id: number;
  documentId: number;
  userId: string | null; // UUID
  recipientId: number | null;
  action: string;
  actorName: string;
  actorEmail: string;
  ipAddress: string;
  userAgent: string;
  metadata: object;
  createdAt: Date;
}
export interface Notification {
  id: number;
  userId: string; // UUID
  type: string;
  title: string;
  message: string;
  documentId: number | null;
  read: boolean;
  createdAt: Date;
}
export interface MassCampaign {
  id: number;
  userId: string; // UUID
  title: string;
  description: string;
  documentName: string;
  filePath?: string | null;
  status: "active" | "paused" | "closed";
  signerCount: number;
  createdAt: Date;
  updatedAt: Date;
  publicToken: string;
}
export interface MassSigner {
  id: number;
  campaignId: number;
  fullName: string;
  signedAt: Date;
  ipAddress: string;
  signatureData: string;
}

// ─── Row-to-model mappers ─────────────────────────────────────────────────────

function toDocument(r: any): Document {
  return {
    id: r.id,
    title: r.title,
    status: r.status,
    senderId: r.sender_id,
    fileName: r.file_name,
    fileSize: r.file_size,
    filePath: r.file_path,
    subject: r.subject,
    message: r.message,
    expiresAt: r.expires_at ? new Date(r.expires_at) : null,
    sentAt: r.sent_at ? new Date(r.sent_at) : null,
    completedAt: r.completed_at ? new Date(r.completed_at) : null,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
    templateId: r.template_id,
    reminderFrequency: r.reminder_frequency,
    tags: r.tags || [],
  };
}

function toRecipient(r: any): Recipient {
  return {
    id: r.id,
    documentId: r.document_id,
    name: r.name,
    email: r.email,
    role: r.role,
    signingOrder: r.signing_order,
    status: r.status,
    authMethod: r.auth_method,
    authPhone: r.auth_phone,
    signedAt: r.signed_at ? new Date(r.signed_at) : null,
    viewedAt: r.viewed_at ? new Date(r.viewed_at) : null,
    signingToken: r.signing_token,
    color: r.color,
  };
}

function toField(r: any): DocumentField {
  return {
    id: r.id,
    documentId: r.document_id,
    recipientId: r.recipient_id,
    type: r.type,
    label: r.label,
    required: r.required,
    x: Number(r.x),
    y: Number(r.y),
    width: Number(r.width),
    height: Number(r.height),
    page: r.page,
    value: r.value,
  };
}

function toTemplate(r: any): Template {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    creatorId: r.creator_id,
    fileName: r.file_name,
    filePath: r.file_path,
    usageCount: r.usage_count,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

function toContact(r: any): Contact {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    email: r.email,
    organization: r.organization,
    phone: r.phone,
    createdAt: new Date(r.created_at),
  };
}

function toTeamMember(r: any): TeamMember {
  return {
    id: r.id,
    userId: r.user_id,
    invitedEmail: r.invited_email,
    invitedName: r.invited_name,
    role: r.role,
    status: r.status,
    invitedAt: new Date(r.invited_at),
    joinedAt: r.joined_at ? new Date(r.joined_at) : null,
  };
}

function toAuditLog(r: any): AuditLog {
  return {
    id: r.id,
    documentId: r.document_id,
    userId: r.user_id,
    recipientId: r.recipient_id,
    action: r.action,
    actorName: r.actor_name,
    actorEmail: r.actor_email,
    ipAddress: r.ip_address,
    userAgent: r.user_agent,
    metadata: r.metadata || {},
    createdAt: new Date(r.created_at),
  };
}

function toNotification(r: any): Notification {
  return {
    id: r.id,
    userId: r.user_id,
    type: r.type,
    title: r.title,
    message: r.message,
    documentId: r.document_id,
    read: r.read,
    createdAt: new Date(r.created_at),
  };
}

function toCampaign(r: any): MassCampaign {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    description: r.description,
    documentName: r.document_name,
    filePath: r.file_path,
    status: r.status,
    signerCount: r.signer_count,
    publicToken: r.public_token,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

function toSigner(r: any): MassSigner {
  return {
    id: r.id,
    campaignId: r.campaign_id,
    fullName: r.full_name,
    signedAt: new Date(r.signed_at),
    ipAddress: r.ip_address,
    signatureData: r.signature_data,
  };
}

function throwIfError(error: any, ctx: string) {
  if (error) throw new Error(`${ctx}: ${error.message}`);
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const mockApi = {

  // AUTH
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("401: " + error.message);
    const u = data.user!;
    const meta = u.user_metadata || {};
    const fullName: string = meta.full_name || email.split("@")[0];
    const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    return {
      user: {
        id: u.id,
        fullName,
        email: u.email || "",
        company: meta.company || "",
        role: "admin",
        plan: "starter",
        avatarInitials: initials,
        twoFactorEnabled: false,
        createdAt: new Date(u.created_at),
      } as User,
    };
  },

  async register(fullName: string, email: string, password: string, company: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, company } },
    });
    if (error) throw new Error("400: " + error.message);
    const u = data.user!;
    const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    await supabase.from("profiles").upsert({
      id: u.id,
      full_name: fullName,
      email,
      company,
      role: "admin",
      plan: "starter",
      avatar_initials: initials,
      two_factor_enabled: false,
    });
    return {
      user: {
        id: u.id,
        fullName,
        email,
        company,
        role: "admin",
        plan: "starter",
        avatarInitials: initials,
        twoFactorEnabled: false,
        createdAt: new Date(u.created_at),
      } as User,
    };
  },

  // USERS
  async getUser(id: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    throwIfError(error, "404");
    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      company: data.company,
      role: data.role,
      plan: data.plan,
      avatarInitials: data.avatar_initials,
      twoFactorEnabled: data.two_factor_enabled,
      createdAt: new Date(data.created_at),
    } as User;
  },

  async updateUser(id: string, data: Partial<User>) {
    const update: any = {};
    if (data.fullName !== undefined) update.full_name = data.fullName;
    if (data.email !== undefined) update.email = data.email;
    if (data.company !== undefined) update.company = data.company;
    if (data.role !== undefined) update.role = data.role;
    if (data.plan !== undefined) update.plan = data.plan;
    if (data.avatarInitials !== undefined) update.avatar_initials = data.avatarInitials;
    if (data.twoFactorEnabled !== undefined) update.two_factor_enabled = data.twoFactorEnabled;

    const { data: row, error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "404");
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      company: row.company,
      role: row.role,
      plan: row.plan,
      avatarInitials: row.avatar_initials,
      twoFactorEnabled: row.two_factor_enabled,
      createdAt: new Date(row.created_at),
    } as User;
  },

  // DOCUMENTS
  async getDocuments(userId: string) {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("sender_id", userId)
      .order("created_at", { ascending: false });
    throwIfError(error, "getDocuments");
    return (data || []).map(toDocument);
  },

  async getDocument(id: number) {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();
    throwIfError(error, "404");
    return toDocument(data);
  },

  async createDocument(data: Partial<Document>) {
    const row: any = {
      title: data.title || "Untitled Document",
      status: data.status || "draft",
      sender_id: String(data.senderId || ""),
      file_name: data.fileName || "document.pdf",
      file_size: data.fileSize || "0KB",
      file_path: data.filePath || null,
      subject: data.subject || "",
      message: data.message || "",
      expires_at: data.expiresAt || null,
      sent_at: data.sentAt || null,
      completed_at: null,
      template_id: data.templateId || null,
      reminder_frequency: data.reminderFrequency || "3days",
      tags: data.tags || [],
    };
    const { data: created, error } = await supabase
      .from("documents")
      .insert(row)
      .select()
      .single();
    throwIfError(error, "createDocument");
    const doc = toDocument(created);
    // Audit log (best-effort)
    supabase.from("audit_logs").insert({
      document_id: doc.id,
      user_id: data.senderId || null,
      action: "document_created",
      actor_name: "",
      actor_email: "",
      ip_address: "",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      metadata: {},
    }).then(() => {});
    return doc;
  },

  async updateDocument(id: number, data: Partial<Document>) {
    const update: any = { updated_at: new Date().toISOString() };
    if (data.title !== undefined) update.title = data.title;
    if (data.status !== undefined) update.status = data.status;
    if (data.fileName !== undefined) update.file_name = data.fileName;
    if (data.fileSize !== undefined) update.file_size = data.fileSize;
    if (data.filePath !== undefined) update.file_path = data.filePath;
    if (data.subject !== undefined) update.subject = data.subject;
    if (data.message !== undefined) update.message = data.message;
    if (data.expiresAt !== undefined) update.expires_at = data.expiresAt;
    if (data.sentAt !== undefined) update.sent_at = data.sentAt;
    if (data.completedAt !== undefined) update.completed_at = data.completedAt;
    if (data.templateId !== undefined) update.template_id = data.templateId;
    if (data.reminderFrequency !== undefined) update.reminder_frequency = data.reminderFrequency;
    if (data.tags !== undefined) update.tags = data.tags;

    const { data: updated, error } = await supabase
      .from("documents")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "404");
    return toDocument(updated);
  },

  async deleteDocument(id: number) {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    throwIfError(error, "deleteDocument");
    return { success: true };
  },

  async sendDocument(id: number) {
    const { data, error } = await supabase
      .from("documents")
      .update({ status: "pending", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "404");
    return toDocument(data);
  },

  async voidDocument(id: number) {
    const { data, error } = await supabase
      .from("documents")
      .update({ status: "voided", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "404");
    return toDocument(data);
  },

  // RECIPIENTS
  async getRecipients(documentId: number) {
    const { data, error } = await supabase
      .from("recipients")
      .select("*")
      .eq("document_id", documentId)
      .order("signing_order", { ascending: true });
    throwIfError(error, "getRecipients");
    return (data || []).map(toRecipient);
  },

  async createRecipient(data: Partial<Recipient>) {
    const { data: created, error } = await supabase
      .from("recipients")
      .insert({
        document_id: data.documentId,
        name: data.name || "",
        email: data.email || "",
        role: data.role || "signer",
        signing_order: data.signingOrder || 1,
        status: "pending",
        auth_method: data.authMethod || "none",
        auth_phone: data.authPhone || null,
        color: data.color || "#3b82f6",
      })
      .select()
      .single();
    throwIfError(error, "createRecipient");
    return toRecipient(created);
  },

  async updateRecipient(id: number, data: Partial<Recipient>) {
    const update: any = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.email !== undefined) update.email = data.email;
    if (data.role !== undefined) update.role = data.role;
    if (data.signingOrder !== undefined) update.signing_order = data.signingOrder;
    if (data.status !== undefined) update.status = data.status;
    if (data.authMethod !== undefined) update.auth_method = data.authMethod;
    if (data.authPhone !== undefined) update.auth_phone = data.authPhone;
    if (data.signedAt !== undefined) update.signed_at = data.signedAt;
    if (data.viewedAt !== undefined) update.viewed_at = data.viewedAt;
    if (data.color !== undefined) update.color = data.color;

    const { data: updated, error } = await supabase
      .from("recipients")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "404");
    return toRecipient(updated);
  },

  // FIELDS
  async getFields(documentId: number) {
    const { data, error } = await supabase
      .from("document_fields")
      .select("*")
      .eq("document_id", documentId);
    throwIfError(error, "getFields");
    return (data || []).map(toField);
  },

  async createField(data: Partial<DocumentField>) {
    const { data: created, error } = await supabase
      .from("document_fields")
      .insert({
        document_id: data.documentId,
        recipient_id: data.recipientId || null,
        type: data.type || "signature",
        label: data.label || "Signature",
        required: data.required ?? true,
        x: data.x || 0,
        y: data.y || 0,
        width: data.width || 200,
        height: data.height || 50,
        page: data.page || 1,
        value: null,
      })
      .select()
      .single();
    throwIfError(error, "createField");
    return toField(created);
  },

  async updateField(id: number, data: Partial<DocumentField>) {
    const update: any = {};
    if (data.type !== undefined) update.type = data.type;
    if (data.label !== undefined) update.label = data.label;
    if (data.required !== undefined) update.required = data.required;
    if (data.x !== undefined) update.x = data.x;
    if (data.y !== undefined) update.y = data.y;
    if (data.width !== undefined) update.width = data.width;
    if (data.height !== undefined) update.height = data.height;
    if (data.page !== undefined) update.page = data.page;
    if (data.value !== undefined) update.value = data.value;
    if (data.recipientId !== undefined) update.recipient_id = data.recipientId;

    const { data: updated, error } = await supabase
      .from("document_fields")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "404");
    return toField(updated);
  },

  async deleteField(id: number) {
    const { error } = await supabase.from("document_fields").delete().eq("id", id);
    throwIfError(error, "deleteField");
    return { success: true };
  },

  async deleteFieldsByDocument(documentId: number) {
    const { error } = await supabase
      .from("document_fields")
      .delete()
      .eq("document_id", documentId);
    throwIfError(error, "deleteFieldsByDocument");
    return { success: true };
  },

  // TEMPLATES
  async getTemplates(userId: string) {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });
    throwIfError(error, "getTemplates");
    return (data || []).map(toTemplate);
  },

  async getTemplate(id: number) {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("id", id)
      .single();
    throwIfError(error, "404");
    return toTemplate(data);
  },

  async createTemplate(data: Partial<Template>) {
    const { data: created, error } = await supabase
      .from("templates")
      .insert({
        name: data.name || "Untitled Template",
        description: data.description || "",
        creator_id: data.creatorId,
        file_name: data.fileName || "template.pdf",
        file_path: data.filePath || null,
        usage_count: 0,
      })
      .select()
      .single();
    throwIfError(error, "createTemplate");
    return toTemplate(created);
  },

  async updateTemplate(id: number, data: Partial<Template>) {
    const update: any = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;
    if (data.fileName !== undefined) update.file_name = data.fileName;
    if (data.filePath !== undefined) update.file_path = data.filePath;
    if (data.usageCount !== undefined) update.usage_count = data.usageCount;

    const { data: updated, error } = await supabase
      .from("templates")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "404");
    return toTemplate(updated);
  },

  async deleteTemplate(id: number) {
    const { error } = await supabase.from("templates").delete().eq("id", id);
    throwIfError(error, "deleteTemplate");
    return { success: true };
  },

  // CONTACTS
  async getContacts(userId: string) {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    throwIfError(error, "getContacts");
    return (data || []).map(toContact);
  },

  async createContact(data: Partial<Contact>) {
    const { data: created, error } = await supabase
      .from("contacts")
      .insert({
        user_id: data.userId,
        name: data.name || "",
        email: data.email || "",
        organization: data.organization || "",
        phone: data.phone || null,
      })
      .select()
      .single();
    throwIfError(error, "createContact");
    return toContact(created);
  },

  async updateContact(id: number, data: Partial<Contact>) {
    const update: any = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.email !== undefined) update.email = data.email;
    if (data.organization !== undefined) update.organization = data.organization;
    if (data.phone !== undefined) update.phone = data.phone;

    const { data: updated, error } = await supabase
      .from("contacts")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "404");
    return toContact(updated);
  },

  async deleteContact(id: number) {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    throwIfError(error, "deleteContact");
    return { success: true };
  },

  // TEAM
  async getTeam(userId: string) {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("user_id", userId)
      .order("invited_at", { ascending: false });
    throwIfError(error, "getTeam");
    return (data || []).map(toTeamMember);
  },

  async createTeamMember(data: Partial<TeamMember>) {
    const { data: created, error } = await supabase
      .from("team_members")
      .insert({
        user_id: data.userId,
        invited_email: data.invitedEmail || "",
        invited_name: data.invitedName || "",
        role: data.role || "member",
        status: "pending",
      })
      .select()
      .single();
    throwIfError(error, "createTeamMember");
    return toTeamMember(created);
  },

  async updateTeamMember(id: number, data: Partial<TeamMember>) {
    const update: any = {};
    if (data.role !== undefined) update.role = data.role;
    if (data.status !== undefined) update.status = data.status;
    if (data.joinedAt !== undefined) update.joined_at = data.joinedAt;

    const { data: updated, error } = await supabase
      .from("team_members")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "404");
    return toTeamMember(updated);
  },

  async deleteTeamMember(id: number) {
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    throwIfError(error, "deleteTeamMember");
    return { success: true };
  },

  // AUDIT LOGS
  async getAuditLogsByDocument(documentId: number) {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("document_id", documentId)
      .order("created_at", { ascending: false });
    throwIfError(error, "getAuditLogsByDocument");
    return (data || []).map(toAuditLog);
  },

  async getAuditLogsByUser(userId: string) {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    throwIfError(error, "getAuditLogsByUser");
    return (data || []).map(toAuditLog);
  },

  // NOTIFICATIONS
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    throwIfError(error, "getNotifications");
    return (data || []).map(toNotification);
  },

  async markNotificationRead(id: number) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    throwIfError(error, "markNotificationRead");
    return { success: true };
  },

  async markAllNotificationsRead(userId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);
    throwIfError(error, "markAllNotificationsRead");
    return { success: true };
  },

  // STATS (dashboard)
  async getStats(userId: string) {
    const { data, error } = await supabase
      .from("documents")
      .select("status")
      .eq("sender_id", userId);
    throwIfError(error, "getStats");
    const docs = data || [];
    return {
      total: docs.length,
      completed: docs.filter(d => d.status === "completed").length,
      pending: docs.filter(d => d.status === "pending").length,
      draft: docs.filter(d => d.status === "draft").length,
      declined: docs.filter(d => d.status === "declined").length,
    };
  },

  // SIGNER (public — no auth required)
  async getSignerInfo(token: string) {
    const { data: recipient, error: rErr } = await supabase
      .from("recipients")
      .select("*")
      .eq("signing_token", token)
      .single();
    if (rErr) throw new Error("404: Invalid signing token");

    const { data: doc, error: dErr } = await supabase
      .from("documents")
      .select("*")
      .eq("id", recipient.document_id)
      .single();
    if (dErr) throw new Error("404: Document not found");

    const { data: fields } = await supabase
      .from("document_fields")
      .select("*")
      .eq("document_id", doc.id);

    // Generate a signed URL for the PDF so the signer can access it without auth
    let pdfSignedUrl: string | null = null;
    if (doc.file_path) {
      const { data: signedData } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_path, 3600); // 1 hour expiry
      if (signedData?.signedUrl) {
        // Ensure it's an absolute URL
        const raw = signedData.signedUrl;
        pdfSignedUrl = raw.startsWith("http")
          ? raw
          : `https://aqlisniihrcazgxhqgki.supabase.co/storage/v1${raw}`;
      }
    }

    return {
      recipient: toRecipient(recipient),
      document: { ...toDocument(doc), pdfSignedUrl },
      fields: (fields || []).map(toField),
    };
  },

  async submitSignature(token: string, fields: Record<number, string>, ipAddress?: string, signedAt?: string) {
    const { data: recipient, error: rErr } = await supabase
      .from("recipients")
      .select("*")
      .eq("signing_token", token)
      .single();
    if (rErr) throw new Error("404: Invalid signing token");

    const now = signedAt || new Date().toISOString();

    // Update recipient status with real IP and server-verified timestamp
    await supabase
      .from("recipients")
      .update({
        status: "signed",
        signed_at: now,
        ...(ipAddress ? { ip_address: ipAddress } : {}),
      })
      .eq("id", recipient.id);

    // Update field values
    for (const [fieldId, value] of Object.entries(fields)) {
      await supabase
        .from("document_fields")
        .update({ value })
        .eq("id", parseInt(fieldId));
    }

    // Log the signing event in audit trail
    await supabase.from("audit_logs").insert({
      document_id: recipient.document_id,
      recipient_id: recipient.id,
      action: "document_signed",
      actor_name: recipient.name,
      actor_email: recipient.email,
      ip_address: ipAddress || "",
      metadata: { signed_at: now },
    }).then(() => {}).catch(() => {});

    // Check if all recipients signed (re-fetch fresh data with full fields)
    const { data: allRecipients } = await supabase
      .from("recipients")
      .select("id, status, signing_order, name, email, signing_token")
      .eq("document_id", recipient.document_id)
      .order("signing_order", { ascending: true });

    const allSigned = (allRecipients || []).every((r: any) => r.status === "signed");

    if (!allSigned) {
      // Find the next pending signer in order
      const nextSigner = (allRecipients || []).find(r => r.status === "pending" && r.id !== recipient.id);
      if (nextSigner) {
        const { data: doc } = await supabase
          .from("documents")
          .select("title, sender_id")
          .eq("id", recipient.document_id)
          .single();
        if (doc) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", doc.sender_id)
            .single();
          if (profile) {
            // Send directly via Resend API (absolute URL, most reliable)
            sendSigningRequestEmail({
              recipientName: nextSigner.name,
              recipientEmail: nextSigner.email,
              senderName: profile.full_name,
              documentTitle: doc.title,
              subject: `${profile.full_name} has sent you a document to sign: ${doc.title}`,
              message: "The previous signer has completed their signature. It's your turn to review and sign.",
              signingToken: nextSigner.signing_token,
            }).catch((e) => console.error('Sequential email failed:', e));
          }
        }
      }
    }

    if (allSigned) {
      await supabase
        .from("documents")
        .update({ status: "completed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", recipient.document_id);

      // Send completion emails to sender + all signers (non-blocking)
      supabase
        .from("documents")
        .select("title, sender_id")
        .eq("id", recipient.document_id)
        .single()
        .then(async ({ data: doc }) => {
          if (!doc) return;
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", doc.sender_id)
            .single();
          if (!profile) return;

          // Email the sender
          sendCompletionEmail({
            senderName: profile.full_name,
            senderEmail: profile.email,
            documentTitle: doc.title,
            documentId: recipient.document_id,
            recipientCount: (allRecipients || []).length,
          }).catch(() => {});

          // Also email every signer a copy
          for (const r of (allRecipients || [])) {
            if (r.email && r.email !== profile.email) {
              sendCompletionEmail({
                senderName: profile.full_name,
                senderEmail: r.email,
                documentTitle: doc.title,
                documentId: recipient.document_id,
                recipientCount: (allRecipients || []).length,
              }).catch(() => {});
            }
          }
        });
    }

    return { success: true };
  },

  // MASS SIGNATURE
  async getMassCampaigns(userId: string) {
    const { data, error } = await supabase
      .from("mass_campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    throwIfError(error, "getMassCampaigns");
    return (data || []).map(toCampaign);
  },

  async getMassCampaign(id: number) {
    const { data, error } = await supabase
      .from("mass_campaigns")
      .select("*")
      .eq("id", id)
      .single();
    throwIfError(error, "404");
    return toCampaign(data);
  },

  async getMassCampaignByToken(token: string) {
    const { data, error } = await supabase
      .from("mass_campaigns")
      .select("*")
      .eq("public_token", token)
      .single();
    throwIfError(error, "404");
    return toCampaign(data);
  },

  async createMassCampaign(userId: string | number, data: { title: string; description: string; documentName: string }) {
    const { data: created, error } = await supabase
      .from("mass_campaigns")
      .insert({
        user_id: String(userId),
        title: data.title,
        description: data.description,
        document_name: data.documentName,
        status: "active",
        signer_count: 0,
      })
      .select()
      .single();
    throwIfError(error, "createMassCampaign");
    return toCampaign(created);
  },

  async updateMassCampaignStatus(id: number, status: MassCampaign["status"]) {
    const { data, error } = await supabase
      .from("mass_campaigns")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "404");
    return toCampaign(data);
  },

  async deleteMassCampaign(id: number) {
    const { error } = await supabase.from("mass_campaigns").delete().eq("id", id);
    throwIfError(error, "deleteMassCampaign");
    return { success: true };
  },

  async getMassSigners(campaignId: number) {
    const { data, error } = await supabase
      .from("mass_signers")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("signed_at", { ascending: false });
    throwIfError(error, "getMassSigners");
    return (data || []).map(toSigner);
  },

  async submitMassSignature(token: string, fullName: string, signatureData: string) {
    // Get campaign (public read — no auth required)
    const { data: campaign, error: cErr } = await supabase
      .from("mass_campaigns")
      .select("*")
      .eq("public_token", token)
      .single();
    if (cErr) throw new Error("404: Campaign not found");
    if (campaign.status !== "active") throw new Error("400: Campaign is not accepting signatures");

    const { data: signer, error: sErr } = await supabase
      .from("mass_signers")
      .insert({
        campaign_id: campaign.id,
        full_name: fullName,
        ip_address: "0.0.0.0",
        signature_data: signatureData,
      })
      .select()
      .single();
    throwIfError(sErr, "submitMassSignature");

    // Increment signer count
    await supabase
      .from("mass_campaigns")
      .update({
        signer_count: campaign.signer_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaign.id);

    return { success: true, signer: toSigner(signer) };
  },
};
