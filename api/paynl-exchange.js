// api/paynl-exchange.js
// Pay.nl Exchange URL — ontvangt betalingsstatussen van Pay.nl
// Pay.nl stuurt een POST naar deze URL bij elke statuswijziging

export default async function handler(req, res) {
  // Pay.nl stuurt GET of POST
  const params = req.method === 'POST' ? req.body : req.query;

  const orderId    = params.order_id || params.orderId;
  const orderStatus= params.order_status || params.orderStatus;
  const extra1     = params.extra1; // e-mail die we meestuurden

  console.log('Pay.nl Exchange:', { orderId, orderStatus, extra1 });

  // Status 100 = betaald, status 95 = geautoriseerd
  if (['100', '95'].includes(String(orderStatus))) {
    // Hier kun je:
    // 1. Supabase aanroepen om gebruiker aan te maken
    // 2. Welkomstmail sturen
    // 3. Betaling loggen in je database

    // Voorbeeld: log naar Supabase (optioneel, uitbreiden naar wens)
    try {
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

      if (SUPABASE_URL && SUPABASE_KEY) {
        await fetch(`${SUPABASE_URL}/rest/v1/betalingen`, {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'apikey':        SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            order_id:   orderId,
            email:      extra1,
            status:     'betaald',
            bedrag:     9900,
            created_at: new Date().toISOString(),
          }),
        });
      }
    } catch (err) {
      console.error('Supabase log fout:', err);
      // Niet fataal — Pay.nl verwacht gewoon "TRUE" terug
    }
  }

  // Pay.nl verwacht "TRUE" als bevestiging dat we de webhook ontvangen hebben
  res.status(200).send('TRUE');
}
