const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const GEMINI_KEY = 'AIzaSyC2Lcy1PTQ9Q81vIUprYeoYCsYs2Bs_4Tw';

async function askGemini(q) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: q }] }] })
  });
  const d = await r.json();
  return d.candidates[0].content.parts[0].text;
}

app.post('/webhook', async (req, res) => {
  const msg = req.body.Body?.trim() || '';
  const lower = msg.toLowerCase();
  let reply = '';

  if (lower === '!ping') reply = 'Pong! ✅';
  else if (lower === '!help') reply = '!ping\n!gemini [sawaal]';
  else if (lower.startsWith('!gemini ')) reply = await askGemini(msg.slice(8));
  else reply = '!help type karo';

  res.set('Content-Type', 'text/xml');
  res.send(`<Response><Message>${reply}</Message></Response>`);
});

app.listen(3000, () => console.log('Bot running on port 3000'));
