const RESEND_API_KEY = "re_G1aHgQU7_7BmnJjFDMWgXXvL9TuFGmyyq";
const FROM_EMAIL = "DraftSendSign <noreply@draftsendsign.com>";
const APP_BASE_URL = "https://app.draftsendsign.com";
const SUPABASE_URL = "https://aqlisniihrcazgxhqgki.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDE0MywiZXhwIjoyMDg4NzI2MTQzfQ.Fyhak2OxvE8uLU25RcHog4QIGjUOJ5KK4WTik2V6Uq0";

const SB_HEADERS = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
};

// Generate fully executed PDF with embedded signatures + certificate page
async function buildSignedPdfAttachment(documentTitle, documentId) {
  try {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    // Find doc by ID (preferred) or fall back to title
    let doc;
    if (documentId) {
      const docRes = await fetch(
        `${SUPABASE_URL}/rest/v1/documents?id=eq.${documentId}&select=*&limit=1`,
        { headers: SB_HEADERS }
      );
      const docs = await docRes.json();
      doc = docs[0];
    }
    if (!doc) {
      const docRes = await fetch(
        `${SUPABASE_URL}/rest/v1/documents?title=eq.${encodeURIComponent(documentTitle)}&select=*&order=id.desc&limit=1`,
        { headers: SB_HEADERS }
      );
      const docs = await docRes.json();
      doc = docs[0];
    }
    if (!doc) return null;

    // Get recipients and fields
    const [recRes, fieldRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/recipients?document_id=eq.${doc.id}&select=*`, { headers: SB_HEADERS }),
      fetch(`${SUPABASE_URL}/rest/v1/document_fields?document_id=eq.${doc.id}&select=*`, { headers: SB_HEADERS }),
    ]);
    const recipients = await recRes.json();
    const fields = await fieldRes.json();

    // Get signed URL and download original PDF
    let pdfBytes;
    if (doc.file_path) {
      const signRes = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/documents/${doc.file_path}`, {
        method: 'POST', headers: { ...SB_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: 300 }),
      });
      const signData = await signRes.json();
      const rawUrl = signData.signedURL;
      const signedUrl = rawUrl?.startsWith('http') ? rawUrl : `${SUPABASE_URL}/storage/v1${rawUrl}`;
      if (signedUrl) {
        const r = await fetch(signedUrl);
        if (r.ok) pdfBytes = Buffer.from(await r.arrayBuffer());
      }
    }

    // Use blank PDF if no file
    const pdfDoc = pdfBytes
      ? await PDFDocument.load(pdfBytes)
      : await PDFDocument.create();
    if (!pdfBytes) pdfDoc.addPage([612, 792]);

    const pages = pdfDoc.getPages();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Embed field values
    for (const field of (fields || []).filter(f => f.value)) {
      const page = pages[(field.page || 1) - 1];
      if (!page) continue;
      const { width: pw, height: ph } = page.getSize();
      const x = (field.x / 100) * pw;
      const y = ph - ((field.y / 100) * ph) - ((field.height / 100) * ph);
      if (field.value.startsWith('data:image')) {
        try {
          const imgBytes = Buffer.from(field.value.split(',')[1], 'base64');
          const img = await pdfDoc.embedPng(imgBytes).catch(() => pdfDoc.embedJpg(imgBytes));
          page.drawImage(img, { x, y, width: (field.width/100)*pw, height: (field.height/100)*ph });
        } catch { page.drawText('(Signed)', { x, y: y+4, size: 11, font: helveticaBold, color: rgb(0.1,0.1,0.7) }); }
      } else {
        const text = field.value.startsWith('typed:') ? field.value.replace('typed:', '') : field.value;
        page.drawText(text, { x, y: y+4, size: 12, font: helveticaBold, color: rgb(0.05,0.05,0.5) });
      }
    }

    // Add signing certificate page
    const cert = pdfDoc.addPage([612, 792]);
    const { width: cw, height: ch } = cert.getSize();
    cert.drawRectangle({ x: 0, y: ch-80, width: cw, height: 80, color: rgb(0.05,0.07,0.09) });
    cert.drawText('SIGNING CERTIFICATE', { x: 40, y: ch-35, size: 16, font: helveticaBold, color: rgb(1,1,1) });
    cert.drawText('DraftSendSign — Legally Binding Electronic Signature Record', { x: 40, y: ch-55, size: 9, font: helvetica, color: rgb(0.7,0.7,0.7) });
    let cy = ch - 110;
    const ln = (label, value) => { cert.drawText(label, { x:40, y:cy, size:9, font:helveticaBold, color:rgb(0.4,0.4,0.4) }); cert.drawText(value||'', { x:160, y:cy, size:9, font:helvetica, color:rgb(0.1,0.1,0.1) }); cy-=18; };
    ln('Document:', doc.title); ln('Document ID:', `DSS-${doc.id}`); ln('Status:', 'COMPLETED'); ln('Completed:', new Date().toLocaleString());
    cy -= 10;
    cert.drawLine({ start:{x:40,y:cy}, end:{x:cw-40,y:cy}, thickness:0.5, color:rgb(0.85,0.85,0.85) }); cy -= 24;
    cert.drawText('SIGNATORIES', { x:40, y:cy, size:11, font:helveticaBold, color:rgb(0.05,0.07,0.09) }); cy -= 20;
    for (const r of (recipients||[])) {
      cert.drawText(r.name||'', { x:40, y:cy, size:10, font:helveticaBold, color:rgb(0.1,0.1,0.1) }); cy -= 14;
      cert.drawText(r.email||'', { x:40, y:cy, size:9, font:helvetica, color:rgb(0.4,0.4,0.4) });
      cert.drawText(`Status: ${(r.status||'').toUpperCase()}`, { x:220, y:cy, size:9, font:helvetica, color:r.status==='signed'?rgb(0.1,0.6,0.2):rgb(0.7,0.4,0) });
      if (r.signed_at) cert.drawText(`Signed: ${new Date(r.signed_at).toLocaleString()}`, { x:350, y:cy, size:8, font:helvetica, color:rgb(0.4,0.4,0.4) });
      cy -= 24;
    }
    cert.drawRectangle({ x:0, y:0, width:cw, height:50, color:rgb(0.97,0.97,0.97) });
    cert.drawText('This certificate is legal evidence of electronic signature under the ESIGN Act.', { x:40, y:30, size:7.5, font:helvetica, color:rgb(0.5,0.5,0.5) });
    cert.drawText(`Generated by DraftSendSign · app.draftsendsign.com · ${new Date().toISOString()}`, { x:40, y:14, size:7, font:helvetica, color:rgb(0.6,0.6,0.6) });

    const finalBytes = await pdfDoc.save();
    return {
      filename: `${documentTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Executed.pdf`,
      content: Buffer.from(finalBytes).toString('base64'),
    };
  } catch (e) {
    console.error('PDF attachment error:', e.message);
    return null;
  }
}

export default async function handler(req, res) {
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
<tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0;font-size:11px;color:#9ca3af;">© 2026 DraftSendSign · Secure document signing</p>
</td></tr>
</table></td></tr></table></body></html>`,
    };

  } else if (type === "completion") {
    // Try to attach the signed PDF
    const attachment = await buildSignedPdfAttachment(params.documentTitle, params.documentId);

    emailPayload = {
      from: FROM_EMAIL,
      to: [params.senderEmail],
      subject: `✓ Document fully executed: ${params.documentTitle}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:#0d1117;padding:28px 40px;text-align:center;"><span style="font-size:22px;font-weight:700;color:#fff;">Draft<span style="color:#c8210d;">Send</span>Sign</span></td></tr>
<tr><td style="padding:36px 40px;text-align:center;">
<div style="display:inline-block;background:#dcfce7;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;margin-bottom:16px;"><span style="font-size:28px;">✓</span></div>
<h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;">Document fully executed</h2>
<p style="margin:0 0 8px;font-size:14px;color:#374151;line-height:1.6;">All ${params.recipientCount} parties have signed <strong>&ldquo;${params.documentTitle}&rdquo;</strong>.</p>
<p style="margin:0 0 24px;font-size:13px;color:#6b7280;">${attachment ? "The executed document is attached to this email." : "You can download the signed copy from your DraftSendSign account."}</p>
<a href="${APP_BASE_URL}/#/documents" style="display:inline-block;background:#c8210d;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;">View in DraftSendSign</a>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0;font-size:11px;color:#9ca3af;">© 2026 DraftSendSign · Secure document signing</p>
</td></tr>
</table></td></tr></table></body></html>`,
      ...(attachment ? { attachments: [attachment] } : {}),
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
