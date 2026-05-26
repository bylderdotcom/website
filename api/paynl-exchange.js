// api/paynl-exchange.js
// Pay.nl Exchange webhook

module.exports = async function handler(req, res) {
  const params = req.method === 'POST' ? req.body : req.query;
  const orderId     = params?.order_id || params?.orderId || '';
  const orderStatus = params?.order_status || params?.orderStatus || '';
  const extra1      = params?.extra1 || '';

  console.log('Pay.nl Exchange:', { orderId, orderStatus, extra1 });

  // Status 100 = betaald
  if (['100', '95'].includes(String(orderStatus))) {
    console.log('Betaling geslaagd voor:', extra1);
    // Hier eventueel Supabase aanroepen
  }

  res.status(200).send('TRUE');
};
