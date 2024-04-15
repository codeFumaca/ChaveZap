import pingCommand from '../commands/ping.js';
import stickerCommand from '../commands/sticker.js';
import imageCommand from '../commands/image.js';
import fbichoCommand from '../commands/bicho.js';
import rastreioCommand from '../commands/rastreio.js';
import instagramCommand from '../commands/instagram.js';
import gptCommand from '../commands/gptChat.js';
import versiculoCommand from '../commands/versiculo.js';
import log from './log.js';
import { everyoneCommand, playCommand, aramCommand } from '../commands/mentions.js';

const commands = {
    'f!gpt': gptCommand,
    'f!i': imageCommand,
    'f!ping': pingCommand,
    'f!s': stickerCommand,
    'f!aram': aramCommand,
    'f!play': playCommand,
    'f!bicho': fbichoCommand,
    'f!paz': versiculoCommand,
    'f!everyone': everyoneCommand,
    'f!rastreio': rastreioCommand,
    'f!instagram': instagramCommand,
    'f!versiculo': versiculoCommand,
};

export default async function commandHandler(message, client) {

    if (!message.body.startsWith('f!')) return;

    const command = message.body.split(' ')[0];

    if (commands[command]) {
        await commands[command](message, client);
    } else {
        console.log(`Comando desconhecido: ${command}`);
    }
};