import qrcode from 'qrcode-terminal';
import messageHandler from './src/handlers/messagehandlers.js';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => { messageHandler(msg) });

client.initialize();
