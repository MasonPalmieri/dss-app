// Email utility — routes through Vercel serverless function to avoid CORS/browser restrictions
const EMAIL_API = "https://app.draftsendsign.com/api/send-email";

export interface SigningEmailParams {
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  documentTitle: string;
  subject: string;
  message: string;
  signingToken: string;
}

export interface CompletionEmailParams {
  senderName: string;
  senderEmail: string;
  documentTitle: string;
  documentId: number;
  recipientCount: number;
}

export async function sendSigningRequestEmail(params: SigningEmailParams): Promise<void> {
  const res = await fetch(EMAIL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "signing_request", ...params }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Email error: ${JSON.stringify(err)}`);
  }
}

export async function sendCompletionEmail(params: CompletionEmailParams): Promise<void> {
  await fetch(EMAIL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "completion", ...params }),
  }).catch(() => {}); // Non-critical — don't throw
}
