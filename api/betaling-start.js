// api/betaling-start.js
// Vercel Serverless Function — Pay.nl transaction start
// Houd de API token server-side, nooit zichtbaar in de browser

export default async function handler(req, res) {
  // Alleen POST toestaan
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers — alleen eigen domein
  res.setHeader('Access-Control-Allow-Origin', 'https://bylder.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Credentials uit Vercel Environment Variables (nooit hardcoden in code)
  const SERVICE_ID = process.env.PAYNL_SERVICE_ID;
  const API_TOKEN  = process.env.PAYNL_API_TOKEN;

  if (!SERVICE_ID || !API_TOKEN) {
    console.error('Pay.nl credentials ontbreken in environment variables');
    return res.status(500).json({ error: 'Betaalservice niet geconfigureerd' });
  }

  try {
    const body = req.body;

    // Valideer verplichte velden
    const required = ['voornaam', 'achternaam', 'email', 'paymentMethod'];
    for (const field of required) {
      if (!body[field]) {
        return res.status(400).json({ error: `Veld ontbreekt: ${field}` });
      }
    }

    // E-mail validatie
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return res.status(400).json({ error: 'Ongeldig e-mailadres' });
    }

    // IP-adres ophalen
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    // Pay.nl payload opbouwen
    const payload = {
      serviceId:   SERVICE_ID,
      amount:      9900,            // €99,00 in centen
      currency:    'EUR',
      description: 'Bylder Lidmaatschap',
      returnUrl:   'https://bylder.com/betalen/succes/',
      exchangeUrl: 'https://bylder.com/api/paynl-exchange/',
      paymentMethod: body.paymentMethod,
      customer: {
        firstName:  body.voornaam,
        lastName:   body.achternaam,
        email:      body.email,
        phone:      body.telefoon || undefined,
        language:   'nl',
        ipAddress,
      },
      extra1: body.email,
      extra2: `${body.voornaam} ${body.achternaam}`,
    };

    // iDEAL bank meegeven
    if (body.issuer) {
      payload.issuer = body.issuer;
    }

    // Pay.nl API aanroepen
    const paynlResponse = await fetch('https://rest-api.pay.nl/v13/Transaction/start', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + Buffer.from(API_TOKEN + ':').toString('base64'),
        'Accept':        'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await paynlResponse.json();

    if (!paynlResponse.ok || !data.transaction?.paymentUrl) {
      console.error('Pay.nl fout:', JSON.stringify(data));
      return res.status(502).json({
        error: data.message || data.error || 'Betaalservice tijdelijk niet beschikbaar'
      });
    }

    // Alleen de betaal-URL terugsturen (geen gevoelige data)
    return res.status(200).json({
      paymentUrl: data.transaction.paymentUrl,
      transactionId: data.transaction.transactionId,
    });

  } catch (err) {
    console.error('Serverless function fout:', err);
    return res.status(500).json({ error: 'Interne serverfout' });
  }
}
