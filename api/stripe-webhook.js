// Handles Stripe webhook events to update subscription status in Supabase

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_PLACEHOLDER';
const SUPABASE_URL = 'https://aqlisniihrcazgxhqgki.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDE0MywiZXhwIjoyMDg4NzI2MTQzfQ.Fyhak2OxvE8uLU25RcHog4QIGjUOJ5KK4WTik2V6Uq0';

const PLAN_MAP = {
  price_pro_monthly_placeholder: 'pro',
  price_pro_annual_placeholder: 'pro',
  price_team_monthly_placeholder: 'team',
  price_team_annual_placeholder: 'team',
  price_business_monthly_placeholder: 'business',
  price_business_annual_placeholder: 'business',
};

async function updateProfile(userId, updates) {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(updates),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // For now, if Stripe not configured, just return 200
  if (STRIPE_WEBHOOK_SECRET.includes('PLACEHOLDER')) {
    return res.status(200).json({ received: true, note: 'Stripe not configured' });
  }

  let event;
  try {
    const stripe = require('stripe')(STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const body = await buffer(req);
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const { type, data } = event;
  const obj = data.object;

  try {
    if (type === 'checkout.session.completed') {
      const userId = obj.metadata?.userId;
      const planKey = obj.metadata?.planKey;
      if (userId && planKey) {
        await updateProfile(userId, {
          stripe_customer_id: obj.customer,
          stripe_subscription_id: obj.subscription,
          subscription_status: 'trialing',
          plan: planKey,
        });
      }
    }

    if (type === 'customer.subscription.updated' || type === 'customer.subscription.created') {
      const userId = obj.metadata?.userId;
      const priceId = obj.items?.data?.[0]?.price?.id;
      const plan = PLAN_MAP[priceId] || 'pro';
      const status = obj.status; // active, trialing, past_due, canceled
      if (userId) {
        await updateProfile(userId, {
          subscription_status: status,
          plan,
          current_period_end: new Date(obj.current_period_end * 1000).toISOString(),
        });
      }
    }

    if (type === 'customer.subscription.deleted') {
      const userId = obj.metadata?.userId;
      if (userId) {
        await updateProfile(userId, {
          subscription_status: 'canceled',
          plan: 'starter',
          stripe_subscription_id: null,
        });
      }
    }

    if (type === 'invoice.payment_failed') {
      const customerId = obj.customer;
      // Look up user by customer ID and mark as past_due
      const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?stripe_customer_id=eq.${customerId}&select=id`, {
        headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` }
      });
      const users = await r.json();
      if (users[0]) {
        await updateProfile(users[0].id, { subscription_status: 'past_due' });
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Helper to read raw body for Stripe signature verification
function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
