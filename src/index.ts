import qrcode from 'qrcode-terminal';
import commandHandler from './handlers/commandHandler.js';

import { Client, Message } from 'whatsapp-web.js';

import whatsappWeb from "whatsapp-web.js";
import { connectar } from './database/index.ts';
import { deleteLogMessage } from './handlers/log.ts';
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
    await commandHandler(msg, client);
});

client.on('message_revoke_everyone', async (after: Message, before: Message) => {
    if (before) await deleteLogMessage(after, before, client);
});

try {
    (async () => {
        await connectar().then(() => {
            client.initialize();
        });
    })();

} catch (error) {
    console.log(error);
}