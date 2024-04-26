import pingCommand from '../commands/ping.ts';
import stickerCommand from '../commands/sticker.ts';
import imageCommand from '../commands/image.ts';
import bichoCommand from '../commands/bicho.ts';
import rastreioCommand from '../commands/rastreio.ts';
import instagramCommand from '../commands/instagram.ts';
import gptCommand from '../commands/gptChat.ts';
import versiculoCommand from '../commands/versiculo.ts';
import log from './log.ts';
import { everyoneCommand, playCommand, aramCommand } from '../commands/mentions.ts';
import { Client, Message } from 'whatsapp-web.js';
import withLogging from './log.ts';

const commands:any = {
    'f!gpt': gptCommand,
    'f!i': imageCommand,
    'f!ping': pingCommand,
    'f!s': stickerCommand,
    'f!aram': aramCommand,
    'f!play': playCommand,
    'f!bicho': bichoCommand,
    'f!paz': versiculoCommand,
    'f!everyone': everyoneCommand,
    'f!rastreio': rastreioCommand,
    'f!instagram': instagramCommand,
    'f!versiculo': versiculoCommand,
};

export default async function commandHandler(message:Message, client:Client) {

    if (!message.body.startsWith('f!')) return;

    const command:string = message.body.split(' ')[0];

    if (commands[command]) {
        const commandWithLogging = withLogging(commands[command]);
        await commandWithLogging(message, client);
    } else {
        message.react('❓');
        message.reply(`Comando desconhecido: ${command}`);
    }
};