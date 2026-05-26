// api/betaling-start.js
// Vercel Serverless Function — Pay.nl transaction start (v2 API)

const https = require('https');
const querystring = require('querystring');

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
      '127.0.0.1';

    // Pay.nl v2 gebruikt form-encoded POST parameters
    const params = {
      token:              API_TOKEN,
      serviceId:          SERVICE_ID,
      amount:             9900,
      finishUrl:          'https://bylder.com/betalen/succes/',
      exchangeUrl:        'https://bylder.com/api/paynl-exchange',
      paymentMethodId:    paymentMethod,
      extra1:             email,
      extra2:             `${voornaam} ${achternaam}`,
      'enduser[initials]':   voornaam.charAt(0),
      'enduser[lastName]':   achternaam,
      'enduser[emailAddress]': email,
      'enduser[language]':   'nl',
      'saleData[invoiceDate]': new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      'saleData[deliveryDate]': new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      'saleData[orderData][0][productId]': 'BYLDER-LID',
      'saleData[orderData][0][description]': 'Bylder Lidmaatschap',
      'saleData[orderData][0][price]': 9900,
      'saleData[orderData][0][quantity]': 1,
      'saleData[orderData][0][vatCode]': 'H',
      'ipAddress': ipAddress,
    };

    if (issuer) params['issuerId'] = issuer;
    if (telefoon) params['enduser[phoneNumber]'] = telefoon;

    const payload = querystring.stringify(params);

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'rest-api.pay.nl',
        path:     '/v7/transaction/start/json',
        method:   'POST',
        headers: {
          'Content-Type':   'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const reqHttp = https.request(options, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => {
          console.log('Pay.nl raw response:', data.substring(0, 500));
          try {
            resolve({ status: r.statusCode, body: JSON.parse(data) });
          } catch(e) {
            reject(new Error('Ongeldig JSON antwoord van Pay.nl: ' + data.substring(0, 200)));
          }
        });
      });

      reqHttp.on('error', reject);
      reqHttp.write(payload);
      reqHttp.end();
    });

    console.log('Pay.nl status:', result.status, 'body:', JSON.stringify(result.body).substring(0, 300));

    // v7 API geeft request.result = '1' bij succes
    if (result.body && result.body.request && result.body.request.result === '1') {
      return res.status(200).json({
        paymentUrl:    result.body.transaction.paymentURL,
        transactionId: result.body.transaction.transactionId,
      });
    } else {
      const errMsg = result.body?.request?.errorMessage
        || result.body?.message
        || JSON.stringify(result.body).substring(0, 200);
      return res.status(502).json({ error: errMsg });
    }

  } catch (err) {
    console.error('Serverless fout:', err.message);
    return res.status(500).json({ error: 'Interne serverfout: ' + err.message });
  }
};
