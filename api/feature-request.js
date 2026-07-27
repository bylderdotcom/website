// api/feature-request.js — publieke meldingen "wat mis je hier?"
//
// De app-kant verzamelt al wensen van ingelogde gebruikers, maar het verkeer zit
// op deze site. Bezoekers die afhaken zijn juist de groep die kan vertellen wat
// er ontbreekt, en die konden tot nu toe niets kwijt. Deze functie schrijft hun
// melding in dezelfde `feature_requests`-tabel als de app, met segment
// 'bezoeker' en bron_repo 'website', zodat alles in één funnel samenkomt.
//
// Geen @supabase/supabase-js: deze repo heeft die dependency niet en één insert
// via de REST-API is niet genoeg reden om hem toe te voegen.

const crypto = require('crypto');

const MAX_PER_UUR = 3;          // per IP, tegen geautomatiseerd gespam
const MIN_SECONDEN_OP_PAGINA = 3; // een mens typt niet binnen 3 seconden een melding

function ipHash(req) {
  // Alleen een hash opslaan, nooit het IP zelf: we hebben het uitsluitend nodig
  // om te tellen, niet om iemand te herkennen. Salt uit de omgeving zodat de
  // hash niet terug te rekenen is naar een IP-adres.
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    'onbekend';
  const salt = process.env.FEEDBACK_IP_SALT || 'bylder-feature-requests';
  return crypto.createHash('sha256').update(salt + ip).digest('hex').slice(0, 32);
}

async function supabase(path, opties = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('supabase-config-ontbreekt');
  return fetch(`${url}/rest/v1/${path}`, {
    ...opties,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(opties.headers || {}),
    },
  });
}

// Zelfde afweging als de voucher-moderatie in de app-repo: bij een storing niet
// blokkeren maar in de wachtrij zetten. Een gemiste melding is duurder dan een
// melding die één dag op review wacht.
async function moderate(tekst) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { status: 'needs_review' };
  try {
    const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system:
        'Je filtert meldingen op een Nederlandse website voor mensen die bouwen, kopen of ' +
        'verbouwen. Bezoekers melden wat ze missen of wat niet werkt. Keur een melding GOED ' +
        'zodra het een serieuze opmerking, klacht, vraag of wens is — ook als die kort, boos, ' +
        'slecht gespeld of onvriendelijk is. Keur alleen AF bij: reclame of links naar andere ' +
        'sites, pogingen tot phishing, willekeurige tekens of onzin, scheldkanonnades zonder ' +
        'inhoud, haatzaaien of discriminatie, en seksuele of gewelddadige inhoud. ' +
        'Antwoord UITSLUITEND met JSON: {"ok": true} of {"ok": false}.',
      messages: [{ role: 'user', content: `Beoordeel deze melding:\n\n${tekst}` }],
    });
    const out = msg.content.find((c) => c.type === 'text');
    const m = out && out.text ? out.text.match(/\{[\s\S]*\}/) : null;
    if (!m) return { status: 'needs_review' };
    return { status: JSON.parse(m[0]).ok ? 'nieuw' : 'spam' };
  } catch (e) {
    console.error('[feature-request] moderatie faalde → needs_review:', e.message);
    return { status: 'needs_review' };
  }
}

module.exports = async function handler(req, res) {
  // CORS staat al site-breed in vercel.json onder headers voor /api/(.*).
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  // Honeypot: een veld dat onzichtbaar is voor mensen. Ingevuld = bot.
  // Stilletjes 200 teruggeven, anders leert de bot dat hij betrapt is.
  if (body.website) return res.status(200).json({ ok: true });

  const seconden = Number(body.seconden);
  if (!Number.isFinite(seconden) || seconden < MIN_SECONDEN_OP_PAGINA) {
    return res.status(200).json({ ok: true });
  }

  const tekst = String(body.tekst || '').trim();
  if (tekst.length < 3) return res.status(400).json({ error: 'Vertel kort wat je mist.' });
  if (tekst.length > 2000) return res.status(400).json({ error: 'Houd het iets korter.' });

  const email = body.email ? String(body.email).trim().slice(0, 200) : null;
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Dat e-mailadres klopt niet.' });
  }

  const hash = ipHash(req);

  try {
    // Throttle. Faalt de telling, dan laten we de melding door: liever een
    // enkele dubbele melding dan een verloren melding.
    const telling = await supabase('rpc/feature_requests_recent_count', {
      method: 'POST',
      body: JSON.stringify({ p_ip_hash: hash }),
    });
    if (telling.ok) {
      const aantal = await telling.json();
      if (Number(aantal) >= MAX_PER_UUR) {
        return res.status(429).json({ error: 'Je hebt net al iets gemeld — probeer het over een uur nog eens.' });
      }
    }

    const { status } = await moderate(tekst);

    const insert = await supabase('feature_requests', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        user_id: null,
        segment: 'bezoeker',
        bron: 'formulier',
        bron_repo: 'website',
        tekst,
        email,
        url: body.url ? String(body.url).slice(0, 300) : null,
        context: body.context ? String(body.context).slice(0, 200) : null,
        ip_hash: hash,
        status,
      }),
    });

    if (!insert.ok) {
      console.error('[feature-request] insert mislukt:', insert.status, await insert.text());
      return res.status(500).json({ error: 'Opslaan mislukt.' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[feature-request] onverwachte fout:', e.message);
    return res.status(500).json({ error: 'Opslaan mislukt.' });
  }
};
