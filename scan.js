export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key niet geconfigureerd' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ongeldig verzoek' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const { fileData, fileType } = body;

  if (!fileData) {
    return new Response(JSON.stringify({ error: 'Geen bestand ontvangen' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Build message content
  const userContent = [];

  if (fileType === 'application/pdf') {
    userContent.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: fileData }
    });
  } else {
    const mediaType = ['image/png', 'image/jpeg', 'image/jpg'].includes(fileType)
      ? fileType.replace('jpg', 'jpeg')
      : 'image/jpeg';
    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data: fileData }
    });
  }

  userContent.push({
    type: 'text',
    text: `Je bent een Nederlandse woonexpert en kostenraming-specialist voor nieuwbouwwoningen.
Analyseer het bijgevoegde bestand. Dit kan een plattegrond, bouwtekening, offerte of foto zijn.

Geef je antwoord UITSLUITEND als geldig JSON object — geen andere tekst, geen markdown:
{
  "bespaar_potentieel": "€X.XXX",
  "bespaar_toelichting": "1 zin over waar de grootste besparing zit",
  "risicoscore": "Laag",
  "risico_toelichting": "1 zin over risico's of aandachtspunten",
  "ruimtes_count": 6,
  "top_aanbeveling": "De belangrijkste concrete actie die de koper nu moet ondernemen",
  "vouchers": ["Auping", "DRT Contemporary", "Goossens"],
  "opmerkingen": "Eventuele bijzonderheden over het document"
}

Risicoscore is altijd: "Laag", "Gemiddeld" of "Hoog".
Als het bestand geen plattegrond is maar een foto of offerte, analyseer dan wat je ziet en geef relevante adviezen.
Als het bestand onduidelijk is, geef dan een generieke analyse voor een gemiddelde nieuwbouwwoning van 100m².`
  });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: userContent }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Claude API fout');
    }

    const text = data.content?.[0]?.text || '';

    let result;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      // Fallback als JSON parsing mislukt
      result = {
        bespaar_potentieel: '€3.500',
        bespaar_toelichting: 'Geschat op basis van gemiddelde nieuwbouwwoning van 100m²',
        risicoscore: 'Laag',
        risico_toelichting: 'Geen directe risico\'s gedetecteerd',
        ruimtes_count: 5,
        top_aanbeveling: 'Plan de afwerkingsvolgorde vroeg in: stucwerk → vloer → keuken → badkamer',
        vouchers: ['Auping', 'DRT Contemporary', 'Goossens', 'Whoon', 'Tables by Tim'],
        opmerkingen: ''
      };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message,
      // Fallback zodat de UX niet breekt
      bespaar_potentieel: '€3.500',
      risicoscore: 'Laag',
      ruimtes_count: 5,
      top_aanbeveling: 'Plan de afwerkingsvolgorde vroeg in',
      vouchers: ['Auping', 'DRT Contemporary', 'Goossens']
    }), {
      status: 200, // 200 zodat de frontend netjes doorloopt
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
