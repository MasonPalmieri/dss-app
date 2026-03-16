import {
  users, documents, recipients, documentFields, templates, contacts,
  teamMembers, auditLogs, notifications,
  type User, type InsertUser,
  type Document, type InsertDocument,
  type Recipient, type InsertRecipient,
  type DocumentField, type InsertDocumentField,
  type Template, type InsertTemplate,
  type Contact, type InsertContact,
  type TeamMember, type InsertTeamMember,
  type AuditLog, type InsertAuditLog,
  type Notification, type InsertNotification,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  // Documents
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUser(userId: number): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: number, data: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<void>;

  // Recipients
  getRecipientsByDocument(documentId: number): Promise<Recipient[]>;
  createRecipient(r: InsertRecipient): Promise<Recipient>;
  updateRecipient(id: number, data: Partial<Recipient>): Promise<Recipient | undefined>;
  getRecipientByToken(token: string): Promise<Recipient | undefined>;

  // Document Fields
  getFieldsByDocument(documentId: number): Promise<DocumentField[]>;
  createField(f: InsertDocumentField): Promise<DocumentField>;
  updateField(id: number, data: Partial<DocumentField>): Promise<DocumentField | undefined>;
  deleteField(id: number): Promise<void>;
  deleteFieldsByDocument(documentId: number): Promise<void>;

  // Templates
  getTemplate(id: number): Promise<Template | undefined>;
  getTemplatesByUser(userId: number): Promise<Template[]>;
  createTemplate(t: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, data: Partial<Template>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<void>;

  // Contacts
  getContactsByUser(userId: number): Promise<Contact[]>;
  createContact(c: InsertContact): Promise<Contact>;
  updateContact(id: number, data: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<void>;

  // Team Members
  getTeamByUser(userId: number): Promise<TeamMember[]>;
  createTeamMember(m: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, data: Partial<TeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<void>;

  // Audit Logs
  getAuditLogsByDocument(documentId: number): Promise<AuditLog[]>;
  getAuditLogsByUser(userId: number): Promise<AuditLog[]>;
  createAuditLog(l: InsertAuditLog): Promise<AuditLog>;

  // Notifications
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(n: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private documents = new Map<number, Document>();
  private recipients = new Map<number, Recipient>();
  private documentFields = new Map<number, DocumentField>();
  private templates = new Map<number, Template>();
  private contacts = new Map<number, Contact>();
  private teamMembers = new Map<number, TeamMember>();
  private auditLogs = new Map<number, AuditLog>();
  private notifications = new Map<number, Notification>();

  private counters = {
    users: 1, documents: 1, recipients: 1, fields: 1, templates: 1,
    contacts: 1, team: 1, audit: 1, notifications: 1
  };

  constructor() {
    this.seed();
  }

  private seed() {
    const now = new Date();
    // Demo user
    const demoUser: User = {
      id: 1, fullName: "Mason Palmieri", email: "mason@palmweb.net",
      password: "demo", company: "DraftSendSign", role: "admin",
      plan: "professional", avatarInitials: "MP", twoFactorEnabled: false,
      createdAt: now,
    };
    this.users.set(1, demoUser);
    this.counters.users = 2;

    // Demo documents
    const statuses = ["completed", "pending", "draft", "completed", "declined", "pending", "completed"];
    const titles = [
      "Software Development Agreement", "NDA - Acme Corp", "Employment Contract - John Smith",
      "Vendor Services Agreement", "Consulting Agreement", "Real Estate Purchase Agreement",
      "Partnership Agreement"
    ];
    const names = ["Sarah Johnson", "Michael Chen", "Emily Davis", "Robert Wilson", "Lisa Park", "James Brown", "Maria Garcia"];
    const emails = ["sarah@acme.com", "michael@techco.com", "emily@startup.io", "robert@realty.com", "lisa@law.com", "james@corp.com", "maria@agency.co"];

    titles.forEach((title, i) => {
      const docId = i + 1;
      const sentAt = new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000);
      const doc: Document = {
        id: docId, title, status: statuses[i], senderId: 1,
        fileName: `${title.toLowerCase().replace(/\s/g, '_')}.pdf`,
        fileSize: `${Math.floor(Math.random() * 500 + 100)}KB`,
        subject: `Please sign: ${title}`, message: "Please review and sign at your earliest convenience.",
        expiresAt: new Date(sentAt.getTime() + 30 * 24 * 60 * 60 * 1000),
        sentAt: statuses[i] !== "draft" ? sentAt : null,
        completedAt: statuses[i] === "completed" ? new Date(sentAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
        createdAt: sentAt, updatedAt: sentAt,
        templateId: null, reminderFrequency: "3days", tags: [],
      };
      this.documents.set(docId, doc);

      const rec: Recipient = {
        id: docId, documentId: docId, name: names[i], email: emails[i],
        role: "signer", signingOrder: 1,
        status: statuses[i] === "completed" ? "signed" : statuses[i] === "pending" ? "viewed" : "pending",
        authMethod: "none", authPhone: null,
        signedAt: statuses[i] === "completed" ? new Date(sentAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
        viewedAt: statuses[i] !== "draft" ? new Date(sentAt.getTime() + 60 * 60 * 1000) : null,
        signingToken: `token_${docId}_${i}`, color: "#3b82f6",
      };
      this.recipients.set(docId, rec);

      const audit: AuditLog = {
        id: docId, documentId: docId, userId: 1, recipientId: null,
        action: "document_created", actorName: "Mason Palmieri", actorEmail: "mason@palmweb.net",
        ipAddress: "192.168.1.1", userAgent: "Chrome/120", metadata: {}, createdAt: sentAt,
      };
      this.auditLogs.set(docId, audit);
    });

    this.counters.documents = titles.length + 1;
    this.counters.recipients = titles.length + 1;
    this.counters.fields = 1;
    this.counters.audit = titles.length + 1;

    // Demo templates
    const templateData = [
      { name: "Standard NDA", description: "One-way non-disclosure agreement" },
      { name: "Employment Agreement", description: "Full-time employee offer letter and contract" },
      { name: "Consulting Agreement", description: "Independent contractor services agreement" },
      { name: "Vendor Contract", description: "Vendor services and payment terms" },
    ];
    templateData.forEach((t, i) => {
      const tpl: Template = {
        id: i + 1, name: t.name, description: t.description, creatorId: 1,
        fileName: `${t.name.toLowerCase().replace(/\s/g, '_')}.pdf`,
        usageCount: Math.floor(Math.random() * 20),
        createdAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      };
      this.templates.set(i + 1, tpl);
    });
    this.counters.templates = templateData.length + 1;

    // Demo contacts
    const contactData = [
      { name: "Sarah Johnson", email: "sarah@acme.com", organization: "Acme Corp" },
      { name: "Michael Chen", email: "michael@techco.com", organization: "TechCo Inc" },
      { name: "Emily Davis", email: "emily@startup.io", organization: "Startup.io" },
      { name: "Robert Wilson", email: "robert@realty.com", organization: "Wilson Realty" },
      { name: "Lisa Park", email: "lisa@law.com", organization: "Park Law Group" },
    ];
    contactData.forEach((c, i) => {
      const contact: Contact = {
        id: i + 1, userId: 1, name: c.name, email: c.email,
        organization: c.organization, phone: null,
        createdAt: new Date(Date.now() - (i + 2) * 5 * 24 * 60 * 60 * 1000),
      };
      this.contacts.set(i + 1, contact);
    });
    this.counters.contacts = contactData.length + 1;

    // Demo team members
    const teamData = [
      { name: "Alex Turner", email: "alex@draftsendSign.com", role: "admin", status: "active" },
      { name: "Casey Morgan", email: "casey@draftsendSign.com", role: "member", status: "active" },
      { name: "Jordan Lee", email: "jordan@draftsendSign.com", role: "viewer", status: "pending" },
    ];
    teamData.forEach((m, i) => {
      const member: TeamMember = {
        id: i + 1, userId: 1, invitedEmail: m.email, invitedName: m.name,
        role: m.role, status: m.status,
        invitedAt: new Date(Date.now() - (i + 1) * 10 * 24 * 60 * 60 * 1000),
        joinedAt: m.status === "active" ? new Date(Date.now() - (i + 1) * 9 * 24 * 60 * 60 * 1000) : null,
      };
      this.teamMembers.set(i + 1, member);
    });
    this.counters.team = teamData.length + 1;

    // Demo notifications
    const notifData = [
      { type: "signed", title: "Document signed", message: "Sarah Johnson signed Software Development Agreement", documentId: 1 },
      { type: "viewed", title: "Document viewed", message: "Michael Chen viewed NDA - Acme Corp", documentId: 2 },
      { type: "completed", title: "Document completed", message: "Employment Contract has been fully executed", documentId: 3 },
      { type: "reminder", title: "Reminder sent", message: "Automatic reminder sent to Robert Wilson", documentId: 4 },
    ];
    notifData.forEach((n, i) => {
      const notif: Notification = {
        id: i + 1, userId: 1, type: n.type, title: n.title, message: n.message,
        documentId: n.documentId, read: i > 1,
        createdAt: new Date(Date.now() - (i + 1) * 2 * 60 * 60 * 1000),
      };
      this.notifications.set(i + 1, notif);
    });
    this.counters.notifications = notifData.length + 1;
  }

  // Users
  async getUser(id: number) { return this.users.get(id); }
  async getUserByEmail(email: string) { return [...this.users.values()].find(u => u.email === email); }
  async createUser(data: InsertUser): Promise<User> {
    const id = this.counters.users++;
    const user: User = { ...data, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id: number, data: Partial<User>) {
    const u = this.users.get(id);
    if (!u) return undefined;
    const updated = { ...u, ...data };
    this.users.set(id, updated);
    return updated;
  }

  // Documents
  async getDocument(id: number) { return this.documents.get(id); }
  async getDocumentsByUser(userId: number) {
    return [...this.documents.values()].filter(d => d.senderId === userId).sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }
  async createDocument(data: InsertDocument): Promise<Document> {
    const id = this.counters.documents++;
    const doc: Document = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    this.documents.set(id, doc);
    return doc;
  }
  async updateDocument(id: number, data: Partial<Document>) {
    const d = this.documents.get(id);
    if (!d) return undefined;
    const updated = { ...d, ...data, updatedAt: new Date() };
    this.documents.set(id, updated);
    return updated;
  }
  async deleteDocument(id: number) { this.documents.delete(id); }

  // Recipients
  async getRecipientsByDocument(documentId: number) {
    return [...this.recipients.values()].filter(r => r.documentId === documentId);
  }
  async createRecipient(data: InsertRecipient): Promise<Recipient> {
    const id = this.counters.recipients++;
    const r: Recipient = { ...data, id };
    this.recipients.set(id, r);
    return r;
  }
  async updateRecipient(id: number, data: Partial<Recipient>) {
    const r = this.recipients.get(id);
    if (!r) return undefined;
    const updated = { ...r, ...data };
    this.recipients.set(id, updated);
    return updated;
  }
  async getRecipientByToken(token: string) {
    return [...this.recipients.values()].find(r => r.signingToken === token);
  }

  // Document Fields
  async getFieldsByDocument(documentId: number) {
    return [...this.documentFields.values()].filter(f => f.documentId === documentId);
  }
  async createField(data: InsertDocumentField): Promise<DocumentField> {
    const id = this.counters.fields++;
    const f: DocumentField = { ...data, id };
    this.documentFields.set(id, f);
    return f;
  }
  async updateField(id: number, data: Partial<DocumentField>) {
    const f = this.documentFields.get(id);
    if (!f) return undefined;
    const updated = { ...f, ...data };
    this.documentFields.set(id, updated);
    return updated;
  }
  async deleteField(id: number) { this.documentFields.delete(id); }
  async deleteFieldsByDocument(documentId: number) {
    [...this.documentFields.entries()].forEach(([id, f]) => {
      if (f.documentId === documentId) this.documentFields.delete(id);
    });
  }

  // Templates
  async getTemplate(id: number) { return this.templates.get(id); }
  async getTemplatesByUser(userId: number) {
    return [...this.templates.values()].filter(t => t.creatorId === userId);
  }
  async createTemplate(data: InsertTemplate): Promise<Template> {
    const id = this.counters.templates++;
    const t: Template = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    this.templates.set(id, t);
    return t;
  }
  async updateTemplate(id: number, data: Partial<Template>) {
    const t = this.templates.get(id);
    if (!t) return undefined;
    const updated = { ...t, ...data, updatedAt: new Date() };
    this.templates.set(id, updated);
    return updated;
  }
  async deleteTemplate(id: number) { this.templates.delete(id); }

  // Contacts
  async getContactsByUser(userId: number) {
    return [...this.contacts.values()].filter(c => c.userId === userId);
  }
  async createContact(data: InsertContact): Promise<Contact> {
    const id = this.counters.contacts++;
    const c: Contact = { ...data, id, createdAt: new Date() };
    this.contacts.set(id, c);
    return c;
  }
  async updateContact(id: number, data: Partial<Contact>) {
    const c = this.contacts.get(id);
    if (!c) return undefined;
    const updated = { ...c, ...data };
    this.contacts.set(id, updated);
    return updated;
  }
  async deleteContact(id: number) { this.contacts.delete(id); }

  // Team Members
  async getTeamByUser(userId: number) {
    return [...this.teamMembers.values()].filter(m => m.userId === userId);
  }
  async createTeamMember(data: InsertTeamMember): Promise<TeamMember> {
    const id = this.counters.team++;
    const m: TeamMember = { ...data, id, invitedAt: new Date() };
    this.teamMembers.set(id, m);
    return m;
  }
  async updateTeamMember(id: number, data: Partial<TeamMember>) {
    const m = this.teamMembers.get(id);
    if (!m) return undefined;
    const updated = { ...m, ...data };
    this.teamMembers.set(id, updated);
    return updated;
  }
  async deleteTeamMember(id: number) { this.teamMembers.delete(id); }

  // Audit Logs
  async getAuditLogsByDocument(documentId: number) {
    return [...this.auditLogs.values()].filter(l => l.documentId === documentId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }
  async getAuditLogsByUser(userId: number) {
    return [...this.auditLogs.values()].filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }
  async createAuditLog(data: InsertAuditLog): Promise<AuditLog> {
    const id = this.counters.audit++;
    const l: AuditLog = { ...data, id, createdAt: new Date() };
    this.auditLogs.set(id, l);
    return l;
  }

  // Notifications
  async getNotificationsByUser(userId: number) {
    return [...this.notifications.values()].filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }
  async createNotification(data: InsertNotification): Promise<Notification> {
    const id = this.counters.notifications++;
    const n: Notification = { ...data, id, createdAt: new Date() };
    this.notifications.set(id, n);
    return n;
  }
  async markNotificationRead(id: number) {
    const n = this.notifications.get(id);
    if (n) this.notifications.set(id, { ...n, read: true });
  }
  async markAllNotificationsRead(userId: number) {
    [...this.notifications.entries()].forEach(([id, n]) => {
      if (n.userId === userId) this.notifications.set(id, { ...n, read: true });
    });
  }
}

export const storage = new MemStorage();
