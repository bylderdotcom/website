// api/full-report.js — returns the PAID line-by-line report.
// Verifies the Stripe Checkout session is paid, then runs a detailed Claude analysis
// on the uploaded quote / builder upgrade list. Requires env: STRIPE_SECRET_KEY, ANTHROPIC_API_KEY.

const Stripe = require('stripe');
const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.bylder.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id, fileData, fileType } = req.body || {};
  if (!session_id) return res.status(400).json({ error: 'Missing session.' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'Payments not configured yet.' });

  // 1) Verify payment before spending any AI cost
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid payment session.' });
  }
  if (!session || session.payment_status !== 'paid') {
    return res.status(402).json({ error: 'Payment not completed.' });
  }

  // 2) Need the file to analyze
  if (!fileData || !fileType) {
    return res.status(400).json({ error: 'Re-upload your document to generate the report.', need_file: true });
  }
  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf';
  if (!isImage && !isPDF) return res.status(400).json({ error: 'Only images and PDF files are allowed.' });

  const prompt = `You are producing a PAID, detailed report for a U.S. homeowner or new-construction buyer who uploaded either a CONTRACTOR QUOTE/BID or a NEW-CONSTRUCTION BUILDER UPGRADE/OPTIONS list. Analyze it line by line against typical U.S. market rates (USD, 2026).

Return ONLY a JSON object:
{
  "doc_type": "contractor_quote" | "builder_upgrades" | "other",
  "summary": "2-3 sentence plain-English verdict",
  "estimated_savings": "$X,XXX",
  "items": [
    {
      "name": "line item / upgrade name",
      "quoted": "$X,XXX or 'n/a'",
      "market_range": "$X,XXX - $X,XXX",
      "verdict": "fair" | "high" | "low" | "take" | "skip" | "negotiate",
      "note": "one concrete sentence: why, and what to do"
    }
  ],
  "negotiation_tips": ["3-5 specific, actionable tips referencing the actual items"],
  "next_steps": ["2-4 concrete next steps"]
}

Rules:
- List EVERY line item / option you can identify (aim for completeness).
- For contractor quotes use verdicts fair/high/low; for builder upgrades use take/skip/negotiate.
- market_range = realistic U.S. range for that item.
- Be specific and reference real numbers from the document where visible.
- Return ONLY the JSON object.`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    let content;
    if (isImage) {
      const valid = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const mediaType = valid.includes(fileType) ? fileType : 'image/jpeg';
      content = [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: fileData } },
        { type: 'text', text: prompt },
      ];
    } else {
      content = [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileData } },
        { type: 'text', text: prompt },
      ];
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content }],
    });

    const raw = response.content[0]?.text || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No valid JSON in response');
    const report = JSON.parse(match[0]);
    return res.status(200).json(report);
  } catch (err) {
    console.error('full-report error:', err);
    return res.status(500).json({ error: 'Could not generate the report. Your payment is safe — please retry from the report page.' });
  }
};
