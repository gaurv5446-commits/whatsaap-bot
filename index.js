const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));

app.post('/webhook', (req, res) => {
  const msg = req.body.Body?.trim().toLowerCase();
  let reply = '';

  if (msg === '!ping') reply = 'Pong! Bot chal raha hai ✅';
  else if (msg === '!help') reply = '!ping - test\n!help - commands';
  else reply = 'Samajh nahi aaya. !help type karo.';

  res.set('Content-Type', 'text/xml');
  res.send(`<Response><Message>${reply}</Message></Response>`);
});

app.listen(3000, () => console.log('Bot running on port 3000'));
