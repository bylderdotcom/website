// api/quote-check.js — US MVP serverless function
// Analyzes an uploaded contractor quote/bid OR a new-construction builder upgrade list
// via the Claude API and returns a short English/USD teaser analysis as JSON.

const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');

module.exports = async function handler(req, res) {
  // CORS — same-origin (bylder.com) for the MVP
  res.setHeader('Access-Control-Allow-Origin', 'https://www.bylder.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileData, fileType } = req.body;
  if (!fileData || !fileType) {
    return res.status(400).json({ error: 'No file provided.' });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf';
  if (!isImage && !isPDF) {
    return res.status(400).json({ error: 'Only images and PDF files are allowed.' });
  }

  const prompt = `You are analyzing a document for a U.S. homeowner or new-construction buyer. It is either:
(A) a CONTRACTOR QUOTE / BID for a remodel or home project, or
(B) a NEW-CONSTRUCTION BUILDER UPGRADE / OPTIONS list (e.g. from a production builder's Design Center).

Assess it against typical U.S. market rates (USD). Be realistic and specific.

Return ONLY a JSON object with exactly these fields:

{
  "doc_type": "contractor_quote" | "builder_upgrades" | "other",
  "headline_number": "$X,XXX",
  "headline_label": "short label, e.g. 'potential savings'",
  "risk_level": "Low" | "Medium" | "High",
  "risk_note": "short note (max 6 words)",
  "items_reviewed": number,
  "top_tip": "one concrete, actionable tip for this buyer (max 18 words)"
}

Rules:
- headline_number: realistic estimated savings/overpay in USD ($500 - $25,000) based on visible line items vs U.S. market rates.
- For builder_upgrades: the tip should steer structural/in-wall items to the builder and cosmetic items (flooring, fixtures, lighting) to cheaper aftermarket.
- For contractor_quote: the tip should focus on the most over/under-priced line item or a negotiation lever.
- items_reviewed: count of distinct line items / options you can identify.
- Return ONLY the JSON object, no other text.`;

  try {
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
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content }],
    });

    const raw = response.content[0]?.text || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No valid JSON in response');
    const parsed = JSON.parse(match[0]);

    return res.status(200).json({
      doc_type: parsed.doc_type || 'other',
      headline_number: parsed.headline_number || '$2,400',
      headline_label: parsed.headline_label || 'potential savings',
      risk_level: parsed.risk_level || 'Medium',
      risk_note: parsed.risk_note || 'a few items to review',
      items_reviewed: parsed.items_reviewed || 6,
      top_tip: parsed.top_tip || 'Ask for an itemized breakdown and compare each line to local market rates.',
    });
  } catch (err) {
    console.error('quote-check.js error:', err);
    return res.status(500).json({ error: 'Analysis temporarily unavailable. Please try again.' });
  }
};
