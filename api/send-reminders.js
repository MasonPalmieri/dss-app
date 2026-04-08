// Daily reminder job — sends reminder emails to pending signers
// Called by Vercel cron or manually

const SUPABASE_URL = 'https://aqlisniihrcazgxhqgki.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDE0MywiZXhwIjoyMDg4NzI2MTQzfQ.Fyhak2OxvE8uLU25RcHog4QIGjUOJ5KK4WTik2V6Uq0';
const RESEND_API_KEY = 're_G1aHgQU7_7BmnJjFDMWgXXvL9TuFGmyyq';
const FROM_EMAIL = 'DraftSendSign <noreply@draftsendsign.com>';
const APP_URL = 'https://app.draftsendsign.com';

const headers = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function db(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });
  return r.json();
}

async function sendReminderEmail({ recipientName, recipientEmail, senderName, documentTitle, signingToken }) {
  const signingUrl = `${APP_URL}/#/sign/${signingToken}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [recipientEmail],
      subject: `Reminder: ${senderName} is waiting for your signature on "${documentTitle}"`,
      html: `
<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:#0d1117;padding:28px 40px;text-align:center;">
  <span style="font-size:22px;font-weight:700;color:#fff;">Draft<span style="color:#c8210d;">Send</span>Sign</span>
</td></tr>
<tr><td style="padding:36px 40px;">
  <p style="margin:0 0 8px;font-size:15px;color:#6b7280;">Hi ${recipientName},</p>
  <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#111827;">Your signature is still needed</h2>
  <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.6;">
    <strong>${senderName}</strong> is waiting for your signature on <strong>&ldquo;${documentTitle}&rdquo;</strong>.
    This is a friendly reminder that the document is still awaiting your review.
  </p>
  <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding:8px 0 28px;">
    <a href="${signingUrl}" style="display:inline-block;background:#c8210d;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
      Sign Document Now
    </a>
  </td></tr></table>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
  <p style="margin:0;font-size:12px;color:#9ca3af;">
    You received this reminder because a document was sent to you via DraftSendSign.
    If you've already signed or don't recognize this request, you can safely ignore this email.
  </p>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
  <p style="margin:0;font-size:11px;color:#9ca3af;">© 2026 DraftSendSign · Secure document signing</p>
</td></tr>
</table></td></tr></table>
</body></html>`,
    }),
  });
  return res.ok;
}

export default async function handler(req, res) {
  // Allow GET for cron, POST for manual trigger
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple auth check for manual POST
  const authHeader = req.headers.authorization;
  if (req.method === 'POST' && authHeader !== `Bearer ${SUPABASE_SERVICE_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = new Date();
  const results = { sent: 0, skipped: 0, errors: 0 };

  try {
    // Get all pending documents with reminder frequency set
    const documents = await db(
      `documents?status=eq.pending&reminder_frequency=neq.none&select=id,title,reminder_frequency,sent_at,sender_id`
    );

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(200).json({ message: 'No documents to remind', ...results });
    }

    for (const doc of documents) {
      // Check if reminder is due based on frequency
      const sentAt = doc.sent_at ? new Date(doc.sent_at) : null;
      if (!sentAt) continue;

      const daysSinceSent = Math.floor((now - sentAt) / (1000 * 60 * 60 * 24));
      const freq = doc.reminder_frequency;

      let isDue = false;
      if (freq === '3days' && daysSinceSent > 0 && daysSinceSent % 3 === 0) isDue = true;
      if (freq === 'weekly' && daysSinceSent > 0 && daysSinceSent % 7 === 0) isDue = true;
      if (freq === 'daily' && daysSinceSent > 0) isDue = true;

      if (!isDue) { results.skipped++; continue; }

      // Get pending recipients for this document
      const recipients = await db(
        `recipients?document_id=eq.${doc.id}&status=eq.pending&select=name,email,signing_token`
      );

      if (!Array.isArray(recipients) || recipients.length === 0) continue;

      // Get sender profile
      const senderRows = await db(`profiles?id=eq.${doc.sender_id}&select=full_name`);
      const senderName = senderRows[0]?.full_name || 'DraftSendSign';

      // Send reminders
      for (const recipient of recipients) {
        try {
          const sent = await sendReminderEmail({
            recipientName: recipient.name,
            recipientEmail: recipient.email,
            senderName,
            documentTitle: doc.title,
            signingToken: recipient.signing_token,
          });
          if (sent) results.sent++;
          else results.errors++;
        } catch {
          results.errors++;
        }
      }

      // Log reminder sent in audit log
      await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          document_id: doc.id,
          user_id: doc.sender_id,
          action: 'reminder_sent',
          actor_name: 'System',
          actor_email: 'system@draftsendsign.com',
          ip_address: '0.0.0.0',
          metadata: { recipients_reminded: recipients.length },
        }),
      });
    }

    return res.status(200).json({
      message: `Reminder job complete`,
      timestamp: now.toISOString(),
      ...results,
    });
  } catch (err) {
    console.error('Reminder job error:', err);
    return res.status(500).json({ error: err.message });
  }
}
