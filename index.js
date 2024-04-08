import qrcode from 'qrcode-terminal';
import messageHandler from './src/handlers/messagehandlers.js';

import pkg from 'whatsapp-web.js';

const { Client, LocalAuth } = pkg;

const wwebVersion = '2.2410.1';
const client = new Client({
    restartOnAuthFail: true,
    webVersionCache: {
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
        type: 'remote',
    },
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