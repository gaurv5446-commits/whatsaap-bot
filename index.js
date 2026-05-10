const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const pino = require('pino');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Simple keep-alive route
app.get('/', (req, res) => {
    res.send('✅ WhatsApp AI Bot is Running!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// ====================== Baileys Bot ======================
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '20.0.0'],
        markOnlineOnConnect: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('Connection closed, reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                setTimeout(startBot, 5000); // 5 second baad reconnect
            }
        } else if (connection === 'open') {
            console.log('✅ Bot Successfully Connected to WhatsApp!');
        }
    });

    // Message handler
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
        const from = m.key.remoteJid;

        console.log(`Message from ${from}: ${text}`);

        if (text.toLowerCase().startsWith('@')) {
            await sock.sendMessage(from, { text: '⏳ Processing your request...' });
            // Yahan baad mein commands handle karenge
        }
    });
}

startBot();

console.log('Bot starting...');
