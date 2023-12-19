import qrcode from 'qrcode-terminal';
import messageHandler from './src/handlers/messagehandlers.js';
import MongoStore from 'wwebjs-mongo/src/MongoStore.js';
import mongoose from 'mongoose';
import pkg from 'whatsapp-web.js';
import dotenv from 'dotenv'

const { Client, RemoteAuth } = pkg;

dotenv.config()

mongoose.connect(process.env.MONGODB_URI).then(() => {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        })
    });

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
    });

    client.on('authenticated', session => {
        console.log(session);
    });

    client.on('message', async msg => { messageHandler(msg) });

    client.initialize();
});