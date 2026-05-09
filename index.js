const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));

const GEMINI_KEY = AIzaSyCJLToYkTVQUjJtMwPODit2B0sGlQVUy2I

async function askGemini(question) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: question }] }] })
  });
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

app.post('/webhook', async (req, res) => {
  const msg = req.body.Body?.trim();
  const lower = msg?.toLowerCase();
  let reply = '';

  if (lower === '!ping') {
    reply = 'Pong! Bot chal raha hai ✅';
  } else if (lower === '!help') {
    reply = '!ping - test\n!gemini [question] - Gemini se pucho\n!help - commands';
  } else if (lower.startsWith('!gemini ')) {
    const q = msg.slice(8);
    reply = await askGemini(q);
  } else {
    reply = '!help type karo commands dekhne ke liye';
  }

  res.set('Content-Type', 'text/xml');
  res.send(`<Response><Message>${reply}</Message></Response>`);
});

app.listen(3000, () => console.log('Bot running on port 3000'));
