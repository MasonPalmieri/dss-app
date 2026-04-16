// Stripe webhook handler — updates subscription status in Supabase
const STRIPE_SECRET_KEY = 'STRIPE_SECRET_KEY_REDACTED';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'STRIPE_WEBHOOK_SECRET_REDACTED';
const SUPABASE_URL = 'https://aqlisniihrcazgxhqgki.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDE0MywiZXhwIjoyMDg4NzI2MTQzfQ.Fyhak2OxvE8uLU25RcHog4QIGjUOJ5KK4WTik2V6Uq0';

// Map price IDs to plan names
const PRICE_TO_PLAN = {
  // New pricing
  'price_1TMtDSH8ezWvGnQeDLXo4ke7': 'individual',
  'price_1TMtEvH8ezWvGnQeUniT3ao4': 'individual',
  'price_1TMtG3H8ezWvGnQeByyiFF4M': 'business',
  // Legacy pricing (existing subscribers)
  'price_1TH3KEH8ezWvGnQel6obXhik': 'pro',
  'price_1TH3KEH8ezWvGnQeAk1AeCyO': 'pro',
  'price_1TH3KdH8ezWvGnQepK5yj2nx': 'team',
  'price_1TH3KwH8ezWvGnQeMFDRiEKM': 'team',
  'price_1TH3LGH8ezWvGnQegcu5cOFY': 'business',
  'price_1TH3LVH8ezWvGnQe4mC0TAci': 'business',
};

const Stripe = require('stripe');

async function updateProfile(userId, updates) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    console.error('Supabase update failed:', await res.text());
  }
}

async function findUserByCustomerId(customerId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?stripe_customer_id=eq.${customerId}&select=id`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  const data = await res.json();
  return data[0]?.id || null;
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = Stripe(STRIPE_SECRET_KEY);
  let event;

  if (STRIPE_WEBHOOK_SECRET) {
    // Verify signature
    try {
      const rawBody = await readRawBody(req);
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }
  } else {
    // No webhook secret set yet — parse body directly (less secure, for initial setup)
    event = req.body;
  }

  const { type, data } = event;
  const obj = data?.object;

  console.log('Stripe webhook:', type);

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
        console.log(`User ${userId} subscribed to ${planKey}`);
      }
    }

    else if (type === 'customer.subscription.updated' || type === 'customer.subscription.created') {
      const userId = obj.metadata?.userId;
      const priceId = obj.items?.data?.[0]?.price?.id;
      const plan = PRICE_TO_PLAN[priceId] || 'pro';
      const status = obj.status; // active, trialing, past_due, canceled, unpaid
      if (userId) {
        await updateProfile(userId, {
          subscription_status: status,
          plan,
          current_period_end: new Date(obj.current_period_end * 1000).toISOString(),
        });
      }
    }

    else if (type === 'customer.subscription.deleted') {
      const userId = obj.metadata?.userId;
      if (userId) {
        await updateProfile(userId, {
          subscription_status: 'canceled',
          plan: 'starter',
          stripe_subscription_id: null,
          current_period_end: null,
        });
        console.log(`User ${userId} subscription canceled — downgraded to starter`);
      }
    }

    else if (type === 'invoice.payment_failed') {
      const customerId = obj.customer;
      const userId = await findUserByCustomerId(customerId);
      if (userId) {
        await updateProfile(userId, { subscription_status: 'past_due' });
        console.log(`User ${userId} payment failed — marked past_due`);
      }
    }

    else if (type === 'invoice.paid') {
      const customerId = obj.customer;
      const userId = await findUserByCustomerId(customerId);
      if (userId) {
        await updateProfile(userId, { subscription_status: 'active' });
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
