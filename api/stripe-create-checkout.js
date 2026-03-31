// Creates a Stripe Checkout session and returns the URL
// Called when user clicks "Upgrade" on billing page

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER';
const APP_URL = 'https://app.draftsendsign.com';

// Price IDs — these will be created in Stripe dashboard
// Format: price_XXXX — replace with real IDs when Stripe is connected
const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly_placeholder',
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual_placeholder',
  team_monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY || 'price_team_monthly_placeholder',
  team_annual: process.env.STRIPE_PRICE_TEAM_ANNUAL || 'price_team_annual_placeholder',
  business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || 'price_business_monthly_placeholder',
  business_annual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL || 'price_business_annual_placeholder',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { planKey, userId, userEmail, annual } = req.body;

  if (!planKey || !userId || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const priceKey = `${planKey}_${annual ? 'annual' : 'monthly'}`;
  const priceId = PRICE_IDS[priceKey];

  if (!priceId || priceId.includes('placeholder')) {
    // Stripe not connected yet — return a helpful message
    return res.status(503).json({ 
      error: 'stripe_not_configured',
      message: 'Stripe integration is not yet configured. Please contact support.'
    });
  }

  try {
    const stripe = require('stripe')(STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId, planKey },
      },
      metadata: { userId, planKey },
      success_url: `${APP_URL}/#/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/#/billing?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
}
