import express from 'express';
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;   // ← Ye line important hai

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY not found in environment variables!");
}

async function askGroq(q) {
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: q }],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const d = await r.json();

    if (!r.ok) {
      console.error("Groq API Error:", d);
      return "API error ho raha hai. Key check karo.";
    }

    return d.choices?.[0]?.message?.content || "Sorry, no response.";
  } catch (err) {
    console.error("Error:", err.message);
    return "Kuch problem ho rahi hai. Baad mein try karo.";
  }
}

app.post('/webhook', async (req, res) => {
  try {
    const msg = (req.body.Body || '').trim();
    console.log("📩 Received:", msg);

    let reply = msg.toLowerCase() === '!ping' 
      ? 'Pong! ✅' 
      : await askGroq(msg);

    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>${reply}</Message></Response>`);
  } catch (error) {
    console.error("Webhook Error:", error);
    res.send(`<Response><Message>Sorry, error occurred.</Message></Response>`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Bot running on port ${PORT}`);
});
