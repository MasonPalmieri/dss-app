// Creates a Stripe Checkout session and returns the URL
const STRIPE_SECRET_KEY = 'STRIPE_SECRET_KEY_REDACTED';
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51NqKFkH8ezWvGnQe02xH3DArexPaIZ4wPH76ZpwMYwuRC46itKBqQ1rRv4keZEbsHUE2NtfyKuA0bXhA1LA25hOt00gdyRW1gy';
const APP_URL = 'https://app.draftsendsign.com';

const PRICE_IDS = {
  individual_monthly:     'price_1TMtDSH8ezWvGnQeDLXo4ke7',
  individual_annual:      'price_1TMtEvH8ezWvGnQeUniT3ao4',
  business_monthly:       'price_1TMtG3H8ezWvGnQeByyiFF4M',
  business_annual:        'price_1TMtG3H8ezWvGnQeByyiFF4M',
  business_per_user:      'price_1TMtQ3H8ezWvGnQe6DV6WYtc', // $2.99/mo per additional user
  // Legacy keys kept for existing subscribers
  pro_monthly:            'price_1TH3KEH8ezWvGnQel6obXhik',
  pro_annual:             'price_1TH3KEH8ezWvGnQeAk1AeCyO',
  team_monthly:           'price_1TH3KdH8ezWvGnQepK5yj2nx',
  team_annual:            'price_1TH3KwH8ezWvGnQeMFDRiEKM',
};

const Stripe = require('stripe');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { planKey, userId, userEmail, annual, additionalUsers = 0 } = req.body;

  if (!planKey || !userId || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const priceKey = `${planKey}_${annual ? 'annual' : 'monthly'}`;
  const priceId = PRICE_IDS[priceKey];

  if (!priceId) {
    return res.status(400).json({ error: `Unknown plan: ${priceKey}` });
  }

  try {
    const stripe = Stripe(STRIPE_SECRET_KEY);

    // Build line items — base plan + per-user add-on for Business
    const lineItems = [{ price: priceId, quantity: 1 }];
    if (planKey === 'business' && additionalUsers > 0) {
      lineItems.push({
        price: PRICE_IDS.business_per_user,
        quantity: additionalUsers,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: lineItems,
      subscription_data: {
        metadata: { userId, planKey, additionalUsers: String(additionalUsers) },
      },
      metadata: { userId, planKey, additionalUsers: String(additionalUsers) },
      success_url: `${APP_URL}/#/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/#/billing?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
}
