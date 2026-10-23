// api/us-waitlist.js — wachtlijst voor de Design Center Upgrade Check (VS, 23-10-2026).
//
// Fase 1 van het VS-plan: meten of er vraag is naar een betaalde upgrade-check vóórdat
// we hem bouwen. De pagina /en-us/upgrade-check/ toont één van drie prijzen; hier komt
// binnen wie zich aanmeldt, met de prijs die hij zag. Aanmeldingen per prijs gedeeld door
// het aantal keer dat die prijs getoond is (GA4-event upgrade_check_view) = de conversie.
//
// Opslag in dezelfde feature_requests-tabel als api/feature-request.js, met segment
// 'us_wachtlijst': die tabel neemt al anonieme meldingen met e-mailadres aan, en voor een
// test van een paar weken is een eigen tabel (met migratie in de app-repo) te veel.
// Opvragen: select email, context, created_at from feature_requests where segment = 'us_wachtlijst'.

const crypto = require('crypto');

const PRIJZEN = [99, 199, 349];
const MAX_PER_UUR = 3;

function ipHash(req) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.headers['x-real-ip'] || 'onbekend';
  const salt = process.env.FEEDBACK_IP_SALT || 'bylder-feature-requests';
  return crypto.createHash('sha256').update(salt + ip).digest('hex').slice(0, 32);
}

async function supabase(path, opties = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('supabase-config-ontbreekt');
  return fetch(`${url}/rest/v1/${path}`, {
    ...opties,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(opties.headers || {}) },
  });
}

const tekst = (v, max) => (v == null ? '' : String(v)).trim().replace(/\s+/g, ' ').slice(0, max);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.bylder.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  // Honeypot en minimale tijd op de pagina: bots vullen elk veld in en zijn binnen een seconde klaar.
  if (body.website) return res.status(200).json({ ok: true });
  if (Number(body.seconden) < 3) return res.status(400).json({ error: 'Please try again.' });

  const email = tekst(body.email, 200).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  const prijs = PRIJZEN.includes(Number(body.prijs)) ? Number(body.prijs) : null;
  const builder = tekst(body.builder, 80);
  const metro = tekst(body.metro, 80);
  const closing = tekst(body.closing, 20);
  const hash = ipHash(req);

  try {
    const telling = await supabase('rpc/feature_requests_recent_count', { method: 'POST', body: JSON.stringify({ p_ip_hash: hash }) });
    if (telling.ok && Number(await telling.json()) >= MAX_PER_UUR) {
      return res.status(429).json({ error: 'You just signed up — thanks! Try again in an hour if something went wrong.' });
    }
    const insert = await supabase('feature_requests', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        user_id: null, segment: 'us_wachtlijst', bron: 'wachtlijst', bron_repo: 'website',
        tekst: `Design Center Upgrade Check, wachtlijst. Prijs getoond: ${prijs ? '$' + prijs : 'onbekend'}.` +
          (builder ? ` Bouwer: ${builder}.` : '') + (metro ? ` Regio: ${metro}.` : '') + (closing ? ` Closing: ${closing}.` : ''),
        email,
        url: '/en-us/upgrade-check/',
        context: JSON.stringify({ prijs, builder, metro, closing }).slice(0, 200),
        ip_hash: hash,
        status: 'nieuw',
      }),
    });
    if (!insert.ok) {
      console.error('[us-waitlist] insert mislukt:', insert.status, await insert.text());
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[us-waitlist] fout:', e.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
