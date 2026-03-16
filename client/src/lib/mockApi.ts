// Client-side mock API — all data lives in memory, no backend needed

export interface User {
  id: number; fullName: string; email: string; password: string;
  company: string; role: string; plan: string; avatarInitials: string;
  twoFactorEnabled: boolean; createdAt: Date;
}
export interface Document {
  id: number; title: string; status: string; senderId: number;
  fileName: string; fileSize: string; subject: string; message: string;
  expiresAt: Date | null; sentAt: Date | null; completedAt: Date | null;
  createdAt: Date; updatedAt: Date; templateId: number | null;
  reminderFrequency: string; tags: string[];
}
export interface Recipient {
  id: number; documentId: number; name: string; email: string;
  role: string; signingOrder: number; status: string; authMethod: string;
  authPhone: string | null; signedAt: Date | null; viewedAt: Date | null;
  signingToken: string; color: string;
}
export interface DocumentField {
  id: number; documentId: number; recipientId: number | null;
  type: string; label: string; required: boolean;
  x: number; y: number; width: number; height: number; page: number;
  value: string | null;
}
export interface Template {
  id: number; name: string; description: string; creatorId: number;
  fileName: string; usageCount: number; createdAt: Date; updatedAt: Date;
}
export interface Contact {
  id: number; userId: number; name: string; email: string;
  organization: string; phone: string | null; createdAt: Date;
}
export interface TeamMember {
  id: number; userId: number; invitedEmail: string; invitedName: string;
  role: string; status: string; invitedAt: Date; joinedAt: Date | null;
}
export interface AuditLog {
  id: number; documentId: number; userId: number; recipientId: number | null;
  action: string; actorName: string; actorEmail: string;
  ipAddress: string; userAgent: string; metadata: object; createdAt: Date;
}
export interface Notification {
  id: number; userId: number; type: string; title: string; message: string;
  documentId: number | null; read: boolean; createdAt: Date;
}
export interface MassCampaign {
  id: number; userId: number; title: string; description: string;
  documentName: string; status: "active" | "paused" | "closed";
  signerCount: number; createdAt: Date; updatedAt: Date;
  // The public token used in the signing URL
  publicToken: string;
}
export interface MassSigner {
  id: number; campaignId: number; fullName: string;
  signedAt: Date; ipAddress: string;
  // Base64 signature data URI
  signatureData: string;
}

class MockStore {
  users = new Map<number, User>();
  documents = new Map<number, Document>();
  recipients = new Map<number, Recipient>();
  fields = new Map<number, DocumentField>();
  templates = new Map<number, Template>();
  contacts = new Map<number, Contact>();
  teamMembers = new Map<number, TeamMember>();
  auditLogs = new Map<number, AuditLog>();
  notifications = new Map<number, Notification>();
  massCampaigns = new Map<number, MassCampaign>();
  massSigners = new Map<number, MassSigner>();

  counters = { users: 2, documents: 8, recipients: 8, fields: 1, templates: 5, contacts: 6, team: 4, audit: 8, notifications: 5, campaigns: 3, signers: 10 };

  constructor() { this.seed(); }

  private seed() {
    const now = new Date();

    // Demo user
    this.users.set(1, {
      id: 1, fullName: "Mason Palmieri", email: "help@draftsendsign.com",
      password: "demo", company: "DraftSendSign", role: "admin",
      plan: "professional", avatarInitials: "MP", twoFactorEnabled: false, createdAt: now,
    });

    // Documents
    const statuses = ["completed", "pending", "draft", "completed", "declined", "pending", "completed"];
    const titles = [
      "Software Development Agreement", "NDA - Acme Corp", "Employment Contract - John Smith",
      "Vendor Services Agreement", "Consulting Agreement", "Real Estate Purchase Agreement", "Partnership Agreement"
    ];
    const names = ["Sarah Johnson", "Michael Chen", "Emily Davis", "Robert Wilson", "Lisa Park", "James Brown", "Maria Garcia"];
    const emails = ["sarah@acme.com", "michael@techco.com", "emily@startup.io", "robert@realty.com", "lisa@law.com", "james@corp.com", "maria@agency.co"];
    const sizes = ["342KB", "218KB", "489KB", "156KB", "302KB", "527KB", "198KB"];

    titles.forEach((title, i) => {
      const docId = i + 1;
      const sentAt = new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000);
      this.documents.set(docId, {
        id: docId, title, status: statuses[i], senderId: 1,
        fileName: `${title.toLowerCase().replace(/\s/g, '_')}.pdf`,
        fileSize: sizes[i], subject: `Please sign: ${title}`,
        message: "Please review and sign at your earliest convenience.",
        expiresAt: new Date(sentAt.getTime() + 30 * 24 * 60 * 60 * 1000),
        sentAt: statuses[i] !== "draft" ? sentAt : null,
        completedAt: statuses[i] === "completed" ? new Date(sentAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
        createdAt: sentAt, updatedAt: sentAt, templateId: null,
        reminderFrequency: "3days", tags: [],
      });
      this.recipients.set(docId, {
        id: docId, documentId: docId, name: names[i], email: emails[i],
        role: "signer", signingOrder: 1,
        status: statuses[i] === "completed" ? "signed" : statuses[i] === "pending" ? "viewed" : "pending",
        authMethod: "none", authPhone: null,
        signedAt: statuses[i] === "completed" ? new Date(sentAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
        viewedAt: statuses[i] !== "draft" ? new Date(sentAt.getTime() + 60 * 60 * 1000) : null,
        signingToken: `token_${docId}_${i}`, color: "#3b82f6",
      });
      this.auditLogs.set(docId, {
        id: docId, documentId: docId, userId: 1, recipientId: null,
        action: "document_created", actorName: "Mason Palmieri", actorEmail: "help@draftsendsign.com",
        ipAddress: "192.168.1.1", userAgent: "Chrome/120", metadata: {}, createdAt: sentAt,
      });
    });

    // Templates
    [
      { name: "Standard NDA", description: "One-way non-disclosure agreement" },
      { name: "Employment Agreement", description: "Full-time employee offer letter and contract" },
      { name: "Consulting Agreement", description: "Independent contractor services agreement" },
      { name: "Vendor Contract", description: "Vendor services and payment terms" },
    ].forEach((t, i) => {
      this.templates.set(i + 1, {
        id: i + 1, name: t.name, description: t.description, creatorId: 1,
        fileName: `${t.name.toLowerCase().replace(/\s/g, '_')}.pdf`,
        usageCount: [12, 8, 15, 4][i],
        createdAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      });
    });

    // Contacts
    [
      { name: "Sarah Johnson", email: "sarah@acme.com", organization: "Acme Corp" },
      { name: "Michael Chen", email: "michael@techco.com", organization: "TechCo Inc" },
      { name: "Emily Davis", email: "emily@startup.io", organization: "Startup.io" },
      { name: "Robert Wilson", email: "robert@realty.com", organization: "Wilson Realty" },
      { name: "Lisa Park", email: "lisa@law.com", organization: "Park Law Group" },
    ].forEach((c, i) => {
      this.contacts.set(i + 1, {
        id: i + 1, userId: 1, name: c.name, email: c.email,
        organization: c.organization, phone: null,
        createdAt: new Date(Date.now() - (i + 2) * 5 * 24 * 60 * 60 * 1000),
      });
    });

    // Team members
    [
      { name: "Alex Turner", email: "alex@draftsendSign.com", role: "admin", status: "active" },
      { name: "Casey Morgan", email: "casey@draftsendSign.com", role: "member", status: "active" },
      { name: "Jordan Lee", email: "jordan@draftsendSign.com", role: "viewer", status: "pending" },
    ].forEach((m, i) => {
      this.teamMembers.set(i + 1, {
        id: i + 1, userId: 1, invitedEmail: m.email, invitedName: m.name,
        role: m.role, status: m.status,
        invitedAt: new Date(Date.now() - (i + 1) * 10 * 24 * 60 * 60 * 1000),
        joinedAt: m.status === "active" ? new Date(Date.now() - (i + 1) * 9 * 24 * 60 * 60 * 1000) : null,
      });
    });

    // Notifications
    [
      { type: "signed", title: "Document signed", message: "Sarah Johnson signed Software Development Agreement", documentId: 1 },
      { type: "viewed", title: "Document viewed", message: "Michael Chen viewed NDA - Acme Corp", documentId: 2 },
      { type: "completed", title: "Document completed", message: "Employment Contract has been fully executed", documentId: 3 },
      { type: "reminder", title: "Reminder sent", message: "Automatic reminder sent to Robert Wilson", documentId: 4 },
    ].forEach((n, i) => {
      this.notifications.set(i + 1, {
        id: i + 1, userId: 1, type: n.type, title: n.title, message: n.message,
        documentId: n.documentId, read: i > 1,
        createdAt: new Date(Date.now() - (i + 1) * 2 * 60 * 60 * 1000),
      });
    });

    // Mass Signature Campaigns
    [
      { title: "Annual Gym Liability Waiver", description: "One-day guest pass liability waiver for all visitors.", documentName: "Gym Liability Waiver.pdf", status: "active" as const, signerCount: 47, token: "camp_gym_waiver_2026", daysAgo: 14 },
      { title: "Photo Release Form", description: "Media release for event photography and marketing use.", documentName: "Photo Release.pdf", status: "active" as const, signerCount: 23, token: "camp_photo_release_2026", daysAgo: 7 },
      { title: "Vendor Booth Agreement", description: "Terms and conditions for vendors at our summer market.", documentName: "Vendor Agreement.pdf", status: "closed" as const, signerCount: 12, token: "camp_vendor_booth_2025", daysAgo: 90 },
    ].forEach((c, i) => {
      const id = i + 1;
      this.massCampaigns.set(id, {
        id, userId: 1, title: c.title, description: c.description,
        documentName: c.documentName, status: c.status, signerCount: c.signerCount,
        publicToken: c.token,
        createdAt: new Date(Date.now() - c.daysAgo * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.floor(c.daysAgo / 2) * 24 * 60 * 60 * 1000),
      });
    });

    // Sample signers for campaign 1
    [
      "Marcus Williams", "Tanya Rodriguez", "Kevin Park", "Brianna Thomas",
      "Derek Santos", "Aaliyah Jackson", "Connor Murphy", "Priya Patel",
    ].forEach((name, i) => {
      this.massSigners.set(i + 1, {
        id: i + 1, campaignId: 1, fullName: name,
        signedAt: new Date(Date.now() - (8 - i) * 24 * 60 * 60 * 1000),
        ipAddress: `192.168.1.${100 + i}`,
        signatureData: "",
      });
    });
  }
}

const store = new MockStore();

function delay(ms = 80) { return new Promise(r => setTimeout(r, ms)); }

// Simulate HTTP-like API surface — returns parsed JSON data directly
export const mockApi = {

  // AUTH
  async login(email: string, password: string) {
    await delay();
    const user = [...store.users.values()].find(u => u.email === email);
    if (!user) throw new Error("401: Invalid credentials");
    if (user.password !== password && password !== "demo") throw new Error("401: Invalid credentials");
    const { password: _, ...safeUser } = user;
    return { user: safeUser };
  },

  async register(fullName: string, email: string, password: string, company: string) {
    await delay();
    const existing = [...store.users.values()].find(u => u.email === email);
    if (existing) throw new Error("400: Email already in use");
    const id = store.counters.users++;
    const user: User = {
      id, fullName, email, password, company, role: "admin", plan: "starter",
      avatarInitials: fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      twoFactorEnabled: false, createdAt: new Date(),
    };
    store.users.set(id, user);
    const { password: _, ...safeUser } = user;
    return { user: safeUser };
  },

  // USERS
  async getUser(id: number) {
    await delay();
    const user = store.users.get(id);
    if (!user) throw new Error("404: User not found");
    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  async updateUser(id: number, data: Partial<User>) {
    await delay();
    const user = store.users.get(id);
    if (!user) throw new Error("404: User not found");
    const updated = { ...user, ...data };
    store.users.set(id, updated);
    const { password: _, ...safeUser } = updated;
    return safeUser;
  },

  // DOCUMENTS
  async getDocuments(userId: number) {
    await delay();
    return [...store.documents.values()]
      .filter(d => d.senderId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getDocument(id: number) {
    await delay();
    const doc = store.documents.get(id);
    if (!doc) throw new Error("404: Document not found");
    return doc;
  },

  async createDocument(data: Partial<Document>) {
    await delay();
    const id = store.counters.documents++;
    const now = new Date();
    const doc: Document = {
      id, title: data.title || "Untitled Document", status: data.status || "draft",
      senderId: data.senderId || 1, fileName: data.fileName || "document.pdf",
      fileSize: data.fileSize || "0KB", subject: data.subject || "",
      message: data.message || "", expiresAt: data.expiresAt || null,
      sentAt: data.sentAt || null, completedAt: null, createdAt: now, updatedAt: now,
      templateId: data.templateId || null, reminderFrequency: data.reminderFrequency || "3days",
      tags: data.tags || [],
    };
    store.documents.set(id, doc);
    store.auditLogs.set(store.counters.audit++, {
      id: store.counters.audit - 1, documentId: id, userId: 1, recipientId: null,
      action: "document_created", actorName: "Mason Palmieri", actorEmail: "help@draftsendsign.com",
      ipAddress: "127.0.0.1", userAgent: navigator.userAgent, metadata: {}, createdAt: now,
    });
    return doc;
  },

  async updateDocument(id: number, data: Partial<Document>) {
    await delay();
    const doc = store.documents.get(id);
    if (!doc) throw new Error("404: Document not found");
    const updated = { ...doc, ...data, updatedAt: new Date() };
    store.documents.set(id, updated);
    return updated;
  },

  async deleteDocument(id: number) {
    await delay();
    store.documents.delete(id);
    return { success: true };
  },

  async sendDocument(id: number) {
    await delay();
    const doc = store.documents.get(id);
    if (!doc) throw new Error("404: Document not found");
    const updated = { ...doc, status: "pending", sentAt: new Date(), updatedAt: new Date() };
    store.documents.set(id, updated);
    return updated;
  },

  async voidDocument(id: number) {
    await delay();
    const doc = store.documents.get(id);
    if (!doc) throw new Error("404: Document not found");
    const updated = { ...doc, status: "voided", updatedAt: new Date() };
    store.documents.set(id, updated);
    return updated;
  },

  // RECIPIENTS
  async getRecipients(documentId: number) {
    await delay();
    return [...store.recipients.values()].filter(r => r.documentId === documentId);
  },

  async createRecipient(data: Partial<Recipient>) {
    await delay();
    const id = store.counters.recipients++;
    const r: Recipient = {
      id, documentId: data.documentId!, name: data.name || "", email: data.email || "",
      role: data.role || "signer", signingOrder: data.signingOrder || 1,
      status: "pending", authMethod: data.authMethod || "none", authPhone: null,
      signedAt: null, viewedAt: null,
      signingToken: `token_${id}_${Date.now()}`, color: data.color || "#3b82f6",
    };
    store.recipients.set(id, r);
    return r;
  },

  async updateRecipient(id: number, data: Partial<Recipient>) {
    await delay();
    const r = store.recipients.get(id);
    if (!r) throw new Error("404: Recipient not found");
    const updated = { ...r, ...data };
    store.recipients.set(id, updated);
    return updated;
  },

  // FIELDS
  async getFields(documentId: number) {
    await delay();
    return [...store.fields.values()].filter(f => f.documentId === documentId);
  },

  async createField(data: Partial<DocumentField>) {
    await delay();
    const id = store.counters.fields++;
    const f: DocumentField = {
      id, documentId: data.documentId!, recipientId: data.recipientId || null,
      type: data.type || "signature", label: data.label || "Signature",
      required: data.required ?? true,
      x: data.x || 0, y: data.y || 0, width: data.width || 200, height: data.height || 50,
      page: data.page || 1, value: null,
    };
    store.fields.set(id, f);
    return f;
  },

  async updateField(id: number, data: Partial<DocumentField>) {
    await delay();
    const f = store.fields.get(id);
    if (!f) throw new Error("404: Field not found");
    const updated = { ...f, ...data };
    store.fields.set(id, updated);
    return updated;
  },

  async deleteField(id: number) {
    await delay();
    store.fields.delete(id);
    return { success: true };
  },

  async deleteFieldsByDocument(documentId: number) {
    await delay();
    [...store.fields.entries()].forEach(([id, f]) => {
      if (f.documentId === documentId) store.fields.delete(id);
    });
    return { success: true };
  },

  // TEMPLATES
  async getTemplates(userId: number) {
    await delay();
    return [...store.templates.values()].filter(t => t.creatorId === userId);
  },

  async getTemplate(id: number) {
    await delay();
    const t = store.templates.get(id);
    if (!t) throw new Error("404: Template not found");
    return t;
  },

  async createTemplate(data: Partial<Template>) {
    await delay();
    const id = store.counters.templates++;
    const now = new Date();
    const t: Template = {
      id, name: data.name || "Untitled Template", description: data.description || "",
      creatorId: data.creatorId || 1, fileName: data.fileName || "template.pdf",
      usageCount: 0, createdAt: now, updatedAt: now,
    };
    store.templates.set(id, t);
    return t;
  },

  async updateTemplate(id: number, data: Partial<Template>) {
    await delay();
    const t = store.templates.get(id);
    if (!t) throw new Error("404: Template not found");
    const updated = { ...t, ...data, updatedAt: new Date() };
    store.templates.set(id, updated);
    return updated;
  },

  async deleteTemplate(id: number) {
    await delay();
    store.templates.delete(id);
    return { success: true };
  },

  // CONTACTS
  async getContacts(userId: number) {
    await delay();
    return [...store.contacts.values()].filter(c => c.userId === userId);
  },

  async createContact(data: Partial<Contact>) {
    await delay();
    const id = store.counters.contacts++;
    const c: Contact = {
      id, userId: data.userId || 1, name: data.name || "", email: data.email || "",
      organization: data.organization || "", phone: data.phone || null, createdAt: new Date(),
    };
    store.contacts.set(id, c);
    return c;
  },

  async updateContact(id: number, data: Partial<Contact>) {
    await delay();
    const c = store.contacts.get(id);
    if (!c) throw new Error("404: Contact not found");
    const updated = { ...c, ...data };
    store.contacts.set(id, updated);
    return updated;
  },

  async deleteContact(id: number) {
    await delay();
    store.contacts.delete(id);
    return { success: true };
  },

  // TEAM
  async getTeam(userId: number) {
    await delay();
    return [...store.teamMembers.values()].filter(m => m.userId === userId);
  },

  async createTeamMember(data: Partial<TeamMember>) {
    await delay();
    const id = store.counters.team++;
    const m: TeamMember = {
      id, userId: data.userId || 1, invitedEmail: data.invitedEmail || "",
      invitedName: data.invitedName || "", role: data.role || "member",
      status: "pending", invitedAt: new Date(), joinedAt: null,
    };
    store.teamMembers.set(id, m);
    return m;
  },

  async updateTeamMember(id: number, data: Partial<TeamMember>) {
    await delay();
    const m = store.teamMembers.get(id);
    if (!m) throw new Error("404: Team member not found");
    const updated = { ...m, ...data };
    store.teamMembers.set(id, updated);
    return updated;
  },

  async deleteTeamMember(id: number) {
    await delay();
    store.teamMembers.delete(id);
    return { success: true };
  },

  // AUDIT LOGS
  async getAuditLogsByDocument(documentId: number) {
    await delay();
    return [...store.auditLogs.values()]
      .filter(l => l.documentId === documentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAuditLogsByUser(userId: number) {
    await delay();
    return [...store.auditLogs.values()]
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // NOTIFICATIONS
  async getNotifications(userId: number) {
    await delay();
    return [...store.notifications.values()]
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async markNotificationRead(id: number) {
    await delay();
    const n = store.notifications.get(id);
    if (n) store.notifications.set(id, { ...n, read: true });
    return { success: true };
  },

  async markAllNotificationsRead(userId: number) {
    await delay();
    [...store.notifications.entries()].forEach(([id, n]) => {
      if (n.userId === userId) store.notifications.set(id, { ...n, read: true });
    });
    return { success: true };
  },

  // STATS (dashboard)
  async getStats(userId: number) {
    await delay();
    const docs = [...store.documents.values()].filter(d => d.senderId === userId);
    return {
      total: docs.length,
      completed: docs.filter(d => d.status === "completed").length,
      pending: docs.filter(d => d.status === "pending").length,
      draft: docs.filter(d => d.status === "draft").length,
      declined: docs.filter(d => d.status === "declined").length,
    };
  },

  // SIGNER (public — no auth)
  async getSignerInfo(token: string) {
    await delay();
    const recipient = [...store.recipients.values()].find(r => r.signingToken === token);
    if (!recipient) throw new Error("404: Invalid signing token");
    const doc = store.documents.get(recipient.documentId);
    if (!doc) throw new Error("404: Document not found");
    const fields = [...store.fields.values()].filter(f => f.documentId === doc.id);
    return { recipient, document: doc, fields };
  },

  async submitSignature(token: string, fields: Record<number, string>) {
    await delay();
    const recipient = [...store.recipients.values()].find(r => r.signingToken === token);
    if (!recipient) throw new Error("404: Invalid signing token");
    const updated = { ...recipient, status: "signed", signedAt: new Date() };
    store.recipients.set(recipient.id, updated);
    // Update field values
    Object.entries(fields).forEach(([fieldId, value]) => {
      const f = store.fields.get(parseInt(fieldId));
      if (f) store.fields.set(parseInt(fieldId), { ...f, value });
    });
    // Check if all recipients signed
    const allRecipients = [...store.recipients.values()].filter(r => r.documentId === recipient.documentId);
    const allSigned = allRecipients.every(r => r.status === "signed");
    if (allSigned) {
      const doc = store.documents.get(recipient.documentId);
      if (doc) store.documents.set(doc.id, { ...doc, status: "completed", completedAt: new Date() });
    }
    return { success: true };
  },

  // MASS SIGNATURE
  async getMassCampaigns(userId: number) {
    await delay();
    return [...store.massCampaigns.values()].filter(c => c.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async getMassCampaign(id: number) {
    await delay();
    const campaign = store.massCampaigns.get(id);
    if (!campaign) throw new Error("404: Campaign not found");
    return campaign;
  },

  async getMassCampaignByToken(token: string) {
    await delay();
    const campaign = [...store.massCampaigns.values()].find(c => c.publicToken === token);
    if (!campaign) throw new Error("404: Campaign not found");
    return campaign;
  },

  async createMassCampaign(userId: number, data: { title: string; description: string; documentName: string }) {
    await delay();
    const id = store.counters.campaigns++;
    const token = `camp_${data.title.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20)}_${Date.now()}`;
    const campaign: MassCampaign = {
      id, userId, title: data.title, description: data.description,
      documentName: data.documentName, status: "active", signerCount: 0,
      publicToken: token, createdAt: new Date(), updatedAt: new Date(),
    };
    store.massCampaigns.set(id, campaign);
    return campaign;
  },

  async updateMassCampaignStatus(id: number, status: MassCampaign["status"]) {
    await delay();
    const campaign = store.massCampaigns.get(id);
    if (!campaign) throw new Error("404: Campaign not found");
    store.massCampaigns.set(id, { ...campaign, status, updatedAt: new Date() });
    return store.massCampaigns.get(id)!;
  },

  async deleteMassCampaign(id: number) {
    await delay();
    store.massCampaigns.delete(id);
    return { success: true };
  },

  async getMassSigners(campaignId: number) {
    await delay();
    return [...store.massSigners.values()]
      .filter(s => s.campaignId === campaignId)
      .sort((a, b) => b.signedAt.getTime() - a.signedAt.getTime());
  },

  async submitMassSignature(token: string, fullName: string, signatureData: string) {
    await delay();
    const campaign = [...store.massCampaigns.values()].find(c => c.publicToken === token);
    if (!campaign) throw new Error("404: Campaign not found");
    if (campaign.status !== "active") throw new Error("400: Campaign is not accepting signatures");
    const id = store.counters.signers++;
    const signer: MassSigner = {
      id, campaignId: campaign.id, fullName,
      signedAt: new Date(), ipAddress: "127.0.0.1", signatureData,
    };
    store.massSigners.set(id, signer);
    // Increment counter on campaign
    store.massCampaigns.set(campaign.id, { ...campaign, signerCount: campaign.signerCount + 1, updatedAt: new Date() });
    return { success: true, signer };
  },
};
