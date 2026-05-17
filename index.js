import express from 'express';
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function askGroq(q) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: q }]
    })
  });

  const d = await r.json();
  if (!d.choices || !d.choices[0]) throw new Error("Groq API error");
  return d.choices[0].message.content;
}

app.post('/webhook', async (req, res) => {
  try {
    const msg = req.body.Body?.trim() || req.body.message || '';
    
    let reply = msg.toLowerCase() === '!ping' 
      ? 'Pong! ✅' 
      : await askGroq(msg);

    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>${reply}</Message></Response>`);
  } catch (error) {
    console.error("Error:", error.message);
    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>Sorry, something went wrong.</Message></Response>`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Bot running on port ${PORT}`);
});
