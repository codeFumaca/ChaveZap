import qrcode from 'qrcode-terminal';
import messageHandler from './src/handlers/messagehandlers.js';

import pkg from 'whatsapp-web.js';

const { Client, LocalAuth } = pkg;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.CHROME_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});


client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message_create', async (msg) => {
    messageHandler(msg, client);
});

client.initialize();