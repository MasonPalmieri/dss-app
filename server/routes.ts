import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(httpServer: Server, app: Express): Promise<void> {

  // AUTH
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    // Demo: accept any password for demo user, or match
    if (user.password !== password && password !== "demo") {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  app.post("/api/auth/register", async (req, res) => {
    const { fullName, email, password, company } = req.body;
    const existing = await storage.getUserByEmail(email);
    if (existing) return res.status(400).json({ error: "Email already in use" });
    const user = await storage.createUser({
      fullName, email, password, company,
      role: "admin", plan: "starter",
      avatarInitials: fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
      twoFactorEnabled: false,
    });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  // USERS
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.patch("/api/users/:id", async (req, res) => {
    const user = await storage.updateUser(parseInt(req.params.id), req.body);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  // DOCUMENTS
  app.get("/api/documents", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    const docs = await storage.getDocumentsByUser(userId);
    res.json(docs);
  });

  app.get("/api/documents/:id", async (req, res) => {
    const doc = await storage.getDocument(parseInt(req.params.id));
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  });

  app.post("/api/documents", async (req, res) => {
    const doc = await storage.createDocument({ ...req.body, senderId: req.body.senderId || 1 });
    await storage.createAuditLog({
      documentId: doc.id, userId: doc.senderId, recipientId: null,
      action: "document_created", actorName: "Mason Palmieri", actorEmail: "mason@palmweb.net",
      ipAddress: "127.0.0.1", userAgent: req.headers["user-agent"] || "", metadata: {},
    });
    res.json(doc);
  });

  app.patch("/api/documents/:id", async (req, res) => {
    const doc = await storage.updateDocument(parseInt(req.params.id), req.body);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  });

  app.delete("/api/documents/:id", async (req, res) => {
    await storage.deleteDocument(parseInt(req.params.id));
    res.json({ success: true });
  });

  app.post("/api/documents/:id/send", async (req, res) => {
    const docId = parseInt(req.params.id);
    const doc = await storage.updateDocument(docId, { status: "pending", sentAt: new Date() });
    if (!doc) return res.status(404).json({ error: "Document not found" });
    await storage.createAuditLog({
      documentId: docId, userId: 1, recipientId: null,
      action: "document_sent", actorName: "Mason Palmieri", actorEmail: "mason@palmweb.net",
      ipAddress: "127.0.0.1", userAgent: req.headers["user-agent"] || "", metadata: {},
    });
    res.json(doc);
  });

  app.post("/api/documents/:id/void", async (req, res) => {
    const docId = parseInt(req.params.id);
    const doc = await storage.updateDocument(docId, { status: "voided" });
    if (!doc) return res.status(404).json({ error: "Document not found" });
    await storage.createAuditLog({
      documentId: docId, userId: 1, recipientId: null,
      action: "document_voided", actorName: "Mason Palmieri", actorEmail: "mason@palmweb.net",
      ipAddress: "127.0.0.1", userAgent: req.headers["user-agent"] || "", metadata: {},
    });
    res.json(doc);
  });

  // RECIPIENTS
  app.get("/api/documents/:id/recipients", async (req, res) => {
    const recs = await storage.getRecipientsByDocument(parseInt(req.params.id));
    res.json(recs);
  });

  app.post("/api/documents/:id/recipients", async (req, res) => {
    const docId = parseInt(req.params.id);
    const token = `sign_${docId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444"];
    const existingRecs = await storage.getRecipientsByDocument(docId);
    const color = colors[existingRecs.length % colors.length];
    const r = await storage.createRecipient({ ...req.body, documentId: docId, signingToken: token, color });
    res.json(r);
  });

  app.patch("/api/recipients/:id", async (req, res) => {
    const r = await storage.updateRecipient(parseInt(req.params.id), req.body);
    if (!r) return res.status(404).json({ error: "Recipient not found" });
    res.json(r);
  });

  // DOCUMENT FIELDS
  app.get("/api/documents/:id/fields", async (req, res) => {
    const fields = await storage.getFieldsByDocument(parseInt(req.params.id));
    res.json(fields);
  });

  app.post("/api/documents/:id/fields", async (req, res) => {
    const f = await storage.createField({ ...req.body, documentId: parseInt(req.params.id) });
    res.json(f);
  });

  app.patch("/api/fields/:id", async (req, res) => {
    const f = await storage.updateField(parseInt(req.params.id), req.body);
    if (!f) return res.status(404).json({ error: "Field not found" });
    res.json(f);
  });

  app.delete("/api/fields/:id", async (req, res) => {
    await storage.deleteField(parseInt(req.params.id));
    res.json({ success: true });
  });

  app.delete("/api/documents/:id/fields", async (req, res) => {
    await storage.deleteFieldsByDocument(parseInt(req.params.id));
    res.json({ success: true });
  });

  // TEMPLATES
  app.get("/api/templates", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    const templates = await storage.getTemplatesByUser(userId);
    res.json(templates);
  });

  app.post("/api/templates", async (req, res) => {
    const t = await storage.createTemplate({ ...req.body, creatorId: req.body.creatorId || 1 });
    res.json(t);
  });

  app.patch("/api/templates/:id", async (req, res) => {
    const t = await storage.updateTemplate(parseInt(req.params.id), req.body);
    if (!t) return res.status(404).json({ error: "Template not found" });
    res.json(t);
  });

  app.delete("/api/templates/:id", async (req, res) => {
    await storage.deleteTemplate(parseInt(req.params.id));
    res.json({ success: true });
  });

  // CONTACTS
  app.get("/api/contacts", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    const contacts = await storage.getContactsByUser(userId);
    res.json(contacts);
  });

  app.post("/api/contacts", async (req, res) => {
    const c = await storage.createContact({ ...req.body, userId: req.body.userId || 1 });
    res.json(c);
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    const c = await storage.updateContact(parseInt(req.params.id), req.body);
    if (!c) return res.status(404).json({ error: "Contact not found" });
    res.json(c);
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    await storage.deleteContact(parseInt(req.params.id));
    res.json({ success: true });
  });

  // TEAM
  app.get("/api/team", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    const members = await storage.getTeamByUser(userId);
    res.json(members);
  });

  app.post("/api/team", async (req, res) => {
    const m = await storage.createTeamMember({ ...req.body, userId: req.body.userId || 1 });
    res.json(m);
  });

  app.patch("/api/team/:id", async (req, res) => {
    const m = await storage.updateTeamMember(parseInt(req.params.id), req.body);
    if (!m) return res.status(404).json({ error: "Member not found" });
    res.json(m);
  });

  app.delete("/api/team/:id", async (req, res) => {
    await storage.deleteTeamMember(parseInt(req.params.id));
    res.json({ success: true });
  });

  // AUDIT LOGS
  app.get("/api/audit-logs", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    const logs = await storage.getAuditLogsByUser(userId);
    res.json(logs);
  });

  app.get("/api/audit-logs/document/:id", async (req, res) => {
    const logs = await storage.getAuditLogsByDocument(parseInt(req.params.id));
    res.json(logs);
  });

  // NOTIFICATIONS
  app.get("/api/notifications", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    const notifs = await storage.getNotificationsByUser(userId);
    res.json(notifs);
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    await storage.markNotificationRead(parseInt(req.params.id));
    res.json({ success: true });
  });

  app.post("/api/notifications/read-all", async (req, res) => {
    const userId = parseInt(req.body.userId) || 1;
    await storage.markAllNotificationsRead(userId);
    res.json({ success: true });
  });

  // SIGNER EXPERIENCE
  app.get("/api/sign/:token", async (req, res) => {
    const recipient = await storage.getRecipientByToken(req.params.token);
    if (!recipient) return res.status(404).json({ error: "Invalid signing link" });
    const doc = await storage.getDocument(recipient.documentId);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    const fields = await storage.getFieldsByDocument(recipient.documentId);
    const allRecipients = await storage.getRecipientsByDocument(recipient.documentId);
    res.json({ recipient, document: doc, fields, recipients: allRecipients });
  });

  app.post("/api/sign/:token/complete", async (req, res) => {
    const recipient = await storage.getRecipientByToken(req.params.token);
    if (!recipient) return res.status(404).json({ error: "Invalid signing link" });
    await storage.updateRecipient(recipient.id, { status: "signed", signedAt: new Date() });
    const doc = await storage.getDocument(recipient.documentId);
    if (doc) {
      const allRecs = await storage.getRecipientsByDocument(recipient.documentId);
      const allSigned = allRecs.every(r => r.id === recipient.id || r.status === "signed" || r.role === "cc");
      if (allSigned) {
        await storage.updateDocument(doc.id, { status: "completed", completedAt: new Date() });
      }
    }
    await storage.createAuditLog({
      documentId: recipient.documentId, userId: null, recipientId: recipient.id,
      action: "document_signed", actorName: recipient.name, actorEmail: recipient.email,
      ipAddress: req.ip || "0.0.0.0", userAgent: req.headers["user-agent"] || "", metadata: {},
    });
    res.json({ success: true });
  });

  // DASHBOARD STATS
  app.get("/api/stats", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    const docs = await storage.getDocumentsByUser(userId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sentThisMonth = docs.filter(d => d.sentAt && new Date(d.sentAt) >= monthStart).length;
    const pendingSignatures = docs.filter(d => d.status === "pending").length;
    const completedDocs = docs.filter(d => d.status === "completed").length;
    const drafts = docs.filter(d => d.status === "draft").length;
    res.json({ sentThisMonth, pendingSignatures, completedDocs, drafts, totalDocuments: docs.length });
  });

}
