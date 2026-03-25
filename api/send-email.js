const RESEND_API_KEY = "re_G1aHgQU7_7BmnJjFDMWgXXvL9TuFGmyyq";
const FROM_EMAIL = "DraftSendSign <noreply@draftsendsign.com>";
const APP_BASE_URL = "https://app.draftsendsign.com";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://app.draftsendsign.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, ...params } = req.body;
  let emailPayload;

  if (type === "signing_request") {
    const signingUrl = `${APP_BASE_URL}/#/sign/${params.signingToken}`;
    emailPayload = {
      from: FROM_EMAIL,
      to: [params.recipientEmail],
      subject: params.subject || `${params.senderName} has sent you a document to sign`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:#0d1117;padding:28px 40px;text-align:center;"><span style="font-size:22px;font-weight:700;color:#fff;">Draft<span style="color:#c8210d;">Send</span>Sign</span></td></tr>
<tr><td style="padding:36px 40px;">
<p style="margin:0 0 8px;font-size:15px;color:#6b7280;">Hi ${params.recipientName},</p>
<h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#111827;">You have a document to sign</h2>
<p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.6;"><strong>${params.senderName}</strong> has sent you <strong>&ldquo;${params.documentTitle}&rdquo;</strong> for your signature.</p>
${params.message ? `<div style="background:#f9fafb;border-left:3px solid #c8210d;padding:14px 18px;border-radius:0 6px 6px 0;margin-bottom:24px;"><p style="margin:0;font-size:13px;color:#4b5563;font-style:italic;">${params.message}</p></div>` : ""}
<table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding:8px 0 28px;">
<a href="${signingUrl}" style="display:inline-block;background:#c8210d;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">Review &amp; Sign Document</a>
</td></tr></table>
<p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Or copy this link:</p>
<p style="margin:0 0 24px;font-size:12px;color:#9ca3af;word-break:break-all;">${signingUrl}</p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
<p style="margin:0;font-size:12px;color:#9ca3af;">Sent by ${params.senderName} via DraftSendSign. If unexpected, ignore this email.</p>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:11px;color:#9ca3af;">© 2026 DraftSendSign · Secure document signing</p></td></tr>
</table></td></tr></table></body></html>`,
    };
  } else if (type === "completion") {
    emailPayload = {
      from: FROM_EMAIL,
      to: [params.senderEmail],
      subject: `✓ Document fully executed: ${params.documentTitle}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:#0d1117;padding:28px 40px;text-align:center;"><span style="font-size:22px;font-weight:700;color:#fff;">Draft<span style="color:#c8210d;">Send</span>Sign</span></td></tr>
<tr><td style="padding:36px 40px;text-align:center;">
<h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;">Document fully executed ✓</h2>
<p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.6;">All ${params.recipientCount} recipient(s) have signed <strong>&ldquo;${params.documentTitle}&rdquo;</strong>.</p>
<a href="${APP_BASE_URL}/#/documents" style="display:inline-block;background:#c8210d;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;">View Documents</a>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:11px;color:#9ca3af;">© 2026 DraftSendSign</p></td></tr>
</table></td></tr></table></body></html>`,
    };
  } else {
    return res.status(400).json({ error: "Unknown email type" });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailPayload),
  });

  const data = await response.json();
  if (!response.ok) return res.status(response.status).json({ error: data });
  return res.status(200).json({ success: true, id: data.id });
}
