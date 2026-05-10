const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_KEY; 

async function askGemini(q) {
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: q }] }] })
    });
    const d = await r.json();
    if (d.candidates && d.candidates[0]) {
      return d.candidates[0].content.parts[0].text;
    }
    return 'Koi jawab nahi mila.';
  } catch (e) {
    return 'Error: ' + e.message;
  }
}

app.post('/webhook', async (req, res) => {
  const msg = req.body.Body?.trim() || '';
  let reply = '';
  if (msg.toLowerCase() === '!ping') {
    reply = 'Pong! ✅';
  } else {
    reply = await askGemini(msg);
  }
  res.set('Content-Type', 'text/xml');
  res.send(`<Response><Message>${reply}</Message></Response>`);
});

app.listen(3000, () => console.log('Bot running on port 3000'));
