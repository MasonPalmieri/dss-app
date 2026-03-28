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

  const { email, fullName } = req.body || {};

  if (!email) return res.status(400).json({ error: "Missing email" });

  const firstName = (fullName || "there").split(" ")[0];
  const dashboardUrl = `${APP_BASE_URL}/#/dashboard`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to DraftSendSign</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:560px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:#0d1117;padding:32px 40px;text-align:center;">
          <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
            Draft<span style="color:#c8210d;">Send</span>Sign
          </span>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:40px 40px 32px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
            Welcome, ${firstName}! Your account is ready.
          </h1>
          <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
            Thanks for joining DraftSendSign.
          </p>
          <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
            DraftSendSign makes it effortless to send legally binding documents for electronic signature — built for speed, compliance, and a seamless signing experience for your recipients. Upload a document, add recipients, and collect signatures in minutes.
          </p>

          <!-- CTA Button -->
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding:4px 0 32px;">
                <a href="${dashboardUrl}"
                   style="display:inline-block;background:#c8210d;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:8px;letter-spacing:0.1px;">
                  Go to Dashboard &rarr;
                </a>
              </td>
            </tr>
          </table>

          <!-- Getting started list -->
          <div style="background:#f9fafb;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#111827;">Get started in 3 steps:</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:4px 0;vertical-align:top;padding-right:10px;">
                  <span style="display:inline-block;background:#c8210d;color:#fff;font-size:11px;font-weight:700;border-radius:50%;width:20px;height:20px;line-height:20px;text-align:center;">1</span>
                </td>
                <td style="padding:4px 0;font-size:13px;color:#374151;">Upload a PDF or Word document</td>
              </tr>
              <tr>
                <td style="padding:4px 0;vertical-align:top;padding-right:10px;">
                  <span style="display:inline-block;background:#c8210d;color:#fff;font-size:11px;font-weight:700;border-radius:50%;width:20px;height:20px;line-height:20px;text-align:center;">2</span>
                </td>
                <td style="padding:4px 0;font-size:13px;color:#374151;">Add recipients and assign signature fields</td>
              </tr>
              <tr>
                <td style="padding:4px 0;vertical-align:top;padding-right:10px;">
                  <span style="display:inline-block;background:#c8210d;color:#fff;font-size:11px;font-weight:700;border-radius:50%;width:20px;height:20px;line-height:20px;text-align:center;">3</span>
                </td>
                <td style="padding:4px 0;font-size:13px;color:#374151;">Download the fully signed document once everyone has signed</td>
              </tr>
            </table>
          </div>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;"/>
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
            Questions? Reply to this email or reach us at
            <a href="mailto:help@draftsendsign.com" style="color:#c8210d;text-decoration:none;">help@draftsendsign.com</a>.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">
            &copy; 2026 DraftSendSign &middot; Secure electronic signature platform
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  const emailPayload = {
    from: FROM_EMAIL,
    to: [email],
    subject: "Welcome to DraftSendSign \u2014 you\u2019re almost in",
    html,
  };

  try {
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
  } catch (err) {
    return res.status(500).json({ error: "Failed to send welcome email" });
  }
}
