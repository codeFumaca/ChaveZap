import pingCommand from '../commands/ping.js';
import stickerCommand from '../commands/sticker.js';
import imageCommand from '../commands/image.js';
import fbichoCommand from '../commands/bicho.js';
import rastreioCommand from '../commands/rastreio.js';
import instagramCommand from '../commands/instagram.js';
import gptCommand from '../commands/gptChat.js';
import versiculoCommand from '../commands/versiculo.js';
import log from './log.js';
import { everyoneCommand , playCommand, aramCommand } from '../commands/mentions.js';

export default async function messageHandler(message, client) {

    if (message.body === '!ping') {
        await pingCommand(message);
    } else if (message.body === 'f!s') {
        await stickerCommand(message);
    } else if (message.body === 'f!i') {
        await imageCommand(message);
    } else if (message.body === 'f!aram') {
        await aramCommand(message, client);
    } else if (message.body === 'f!everyone') {
        await everyoneCommand(message, client);
    } else if (message.body === 'f!play') {
        await playCommand(message, client);
    } else if (message.body === 'f!bicho') {
        await fbichoCommand(message);
    } else if (message.body.startsWith('f!rastreio ')) {
        await rastreioCommand(message);
    } else if (message.body.startsWith('f!instagram ')) {
        await instagramCommand(message);
    } else if (message.body.startsWith('f!gpt ')) {
        await gptCommand(message);
    } else if (message.body.startsWith('f!versiculo ') || message.body === 'f!paz') {
        await versiculoCommand(message)
    }

    // await log(message, client);
};