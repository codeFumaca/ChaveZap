import qrcode from 'qrcode-terminal';
import commandHandler from './src/handlers/commandHandler.js';

import { Client, Message } from 'whatsapp-web.js';

import whatsappWeb from "whatsapp-web.js";
import { connectar } from './src/database/db.ts';
const LocalAuth = whatsappWeb.LocalAuth;


const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.CHROME_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox',],
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message_create', async (msg: Message) => {
    commandHandler(msg, client);
});

try {
    await connectar();
    client.initialize();
} catch (error) {
    console.log(error);
}