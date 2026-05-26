// api/betaling-start.js
// Vercel Serverless Function — Pay.nl transaction start

const https = require('https');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const SERVICE_ID = process.env.PAYNL_SERVICE_ID;
  const API_TOKEN  = process.env.PAYNL_API_TOKEN;

  if (!SERVICE_ID || !API_TOKEN) {
    console.error('Pay.nl credentials ontbreken');
    return res.status(500).json({ error: 'Betaalservice niet geconfigureerd' });
  }

  try {
    const body = req.body || {};

    const { voornaam, achternaam, email, telefoon, paymentMethod, issuer } = body;

    if (!voornaam || !achternaam || !email || !paymentMethod) {
      return res.status(400).json({ error: 'Verplichte velden ontbreken' });
    }

    const ipAddress =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      '127.0.0.1';

    const payload = JSON.stringify({
      serviceId:     SERVICE_ID,
      amount:        { value: 9900, currency: 'EUR' },
      description:   'Bylder Lidmaatschap',
      returnUrl:     'https://bylder.com/betalen/succes/',
      exchangeUrl:   'https://bylder.com/api/paynl-exchange',
      paymentMethod: { id: paymentMethod },
      customer: {
        firstName:  voornaam,
        lastName:   achternaam,
        email:      email,
        phone:      telefoon || '',
        language:   'nl',
        ipAddress,
      },
      ...(issuer ? { issuer } : {}),
      extra1: email,
      extra2: `${voornaam} ${achternaam}`,
    });

    const auth = Buffer.from(`${API_TOKEN}:`).toString('base64');

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'rest-api.pay.nl',
        path:     '/v13/Transaction/start',
        method:   'POST',
        headers: {
          'Content-Type':   'application/json',
          'Authorization':  `Basic ${auth}`,
          'Accept':         'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const reqHttp = https.request(options, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => {
          try { resolve({ status: r.statusCode, body: JSON.parse(data) }); }
          catch(e) { reject(new Error('Ongeldig JSON antwoord van Pay.nl: ' + data)); }
        });
      });

      reqHttp.on('error', reject);
      reqHttp.write(payload);
      reqHttp.end();
    });

    console.log('Pay.nl response status:', result.status);
    console.log('Pay.nl response body:', JSON.stringify(result.body));

    if (result.body && result.body.transaction && result.body.transaction.paymentUrl) {
      return res.status(200).json({
        paymentUrl:    result.body.transaction.paymentUrl,
        transactionId: result.body.transaction.transactionId,
      });
    } else {
      const errMsg = result.body?.message || result.body?.error || JSON.stringify(result.body);
      return res.status(502).json({ error: errMsg });
    }

  } catch (err) {
    console.error('Serverless fout:', err.message);
    return res.status(500).json({ error: 'Interne serverfout: ' + err.message });
  }
};
