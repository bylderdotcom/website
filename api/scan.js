// api/scan.js — Vercel serverless function voor de homepage QuickScan
// Analyseert een geüpload document (plattegrond/tekening) via Claude API

const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://www.bylder.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileData, fileType, fileName } = req.body;

  if (!fileData || !fileType) {
    return res.status(400).json({ error: 'Geen bestand meegestuurd.' });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf';

  if (!isImage && !isPDF) {
    return res.status(400).json({ error: 'Alleen afbeeldingen en PDF bestanden zijn toegestaan.' });
  }

  const prompt = `Je analyseert een plattegrond of technische tekening van een woning voor een Nederlandse nieuwbouwkoper.

Geef een beknopte analyse en retourneer ALLEEN een JSON-object met precies deze velden:

{
  "bespaar_potentieel": "€X.XXX",
  "bespaar_toelichting": "korte toelichting (max 6 woorden)",
  "risicoscore": "Laag" of "Gemiddeld" of "Hoog",
  "risico_toelichting": "korte toelichting (max 6 woorden)",
  "ruimtes_count": getal,
  "top_aanbeveling": "één concrete aanbeveling voor de koper (max 15 woorden)"
}

Regels voor de waarden:
- bespaar_potentieel: realistische schatting op basis van zichtbare ruimtes (€1.500 - €8.000)
- risicoscore: gebaseerd op complexiteit van de plattegrond
- ruimtes_count: het aantal herkenbare ruimtes (woonkamer, keuken, slaapkamers etc.)
- top_aanbeveling: specifiek en actionable, gericht op nieuwbouwkoper

Retourneer ALLEEN het JSON-object, geen andere tekst.`;

  try {
    let messageContent;

    if (isImage) {
      const validMediaTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const mediaType = validMediaTypes.includes(fileType) ? fileType : 'image/jpeg';
      messageContent = [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: fileData }
        },
        { type: 'text', text: prompt }
      ];
    } else {
      // PDF
      messageContent = [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: fileData }
        },
        { type: 'text', text: prompt }
      ];
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      messages: [{ role: 'user', content: messageContent }]
    });

    const raw = response.content[0]?.text || '';

    // Parse JSON uit de response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Geen geldig JSON in response');

    const parsed = JSON.parse(jsonMatch[0]);

    return res.status(200).json({
      bespaar_potentieel: parsed.bespaar_potentieel || '€3.500',
      bespaar_toelichting: parsed.bespaar_toelichting || 'op materialen en arbeid',
      risicoscore: parsed.risicoscore || 'Laag',
      risico_toelichting: parsed.risico_toelichting || 'geen opvallende risico\'s',
      ruimtes_count: parsed.ruimtes_count || 6,
      top_aanbeveling: parsed.top_aanbeveling || 'Vraag je meerwerklijst op en laat die controleren'
    });

  } catch (err) {
    console.error('scan.js error:', err);
    return res.status(500).json({ error: 'Analyse tijdelijk niet beschikbaar. Probeer het opnieuw.' });
  }
};
