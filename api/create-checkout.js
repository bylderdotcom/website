// api/create-checkout.js — creates a Stripe Checkout Session for the US full report.
// One-time payment. Price is env-driven (STRIPE_PRICE_CENTS, default $29).
// Requires env: STRIPE_SECRET_KEY. Until that's set, returns 503 so the UI shows a graceful fallback.

const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.bylder.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Payments not configured yet.' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const amount = parseInt(process.env.STRIPE_PRICE_CENTS || '2900', 10); // default $29.00
  const origin = 'https://www.bylder.com';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name: 'Bylder Full Quote Report',
            description: 'Line-by-line AI analysis of your contractor quote or builder upgrade list — what to negotiate and what to skip.',
          },
        },
      }],
      success_url: origin + '/en-us/report/?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: origin + '/en-us/?canceled=1',
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-checkout error:', err);
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
};
