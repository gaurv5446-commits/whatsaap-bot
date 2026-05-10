const express = require('express');
require('dotenv').config(); // Load environment variables
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Initialize Gemini API with key from environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function askGemini(q) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(q);
    const response = await result.response;
    return response.text();
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
