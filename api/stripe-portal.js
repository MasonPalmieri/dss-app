// Creates a Stripe Customer Portal session for managing/canceling subscription

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER';
const APP_URL = 'https://app.draftsendsign.com';
const SUPABASE_URL = 'https://aqlisniihrcazgxhqgki.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDE0MywiZXhwIjoyMDg4NzI2MTQzfQ.Fyhak2OxvE8uLU25RcHog4QIGjUOJ5KK4WTik2V6Uq0';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (STRIPE_SECRET_KEY.includes('PLACEHOLDER')) {
    return res.status(503).json({ error: 'stripe_not_configured' });
  }

  const { userId } = req.body;

  // Get customer ID from Supabase
  const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=stripe_customer_id`, {
    headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` }
  });
  const profiles = await r.json();
  const customerId = profiles[0]?.stripe_customer_id;

  if (!customerId) {
    return res.status(404).json({ error: 'No Stripe customer found' });
  }

  try {
    const stripe = require('stripe')(STRIPE_SECRET_KEY);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/#/billing`,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
