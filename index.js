const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

async function askGroq(q) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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'
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: q }]
    })
  });
  const d = await r.json();
  return d.choices[0].message.content;
}

app.post('/webhook', async (req, res) => {
  const msg = req.body.Body?.trim() || '';
  let reply = msg.toLowerCase() === '!ping' ? 'Pong! ✅' : await askGroq(msg);
  res.set('Content-Type', 'text/xml');
  re
