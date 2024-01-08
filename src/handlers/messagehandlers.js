import pingCommand from '../commands/ping.js';
import stickerCommand from '../commands/sticker.js';
import imageCommand from '../commands/image.js';
import aramCommand from '../commands/aram.js';
import playCommand from '../commands/play.js';
import fbichoCommand from '../commands/bicho.js';
import rastreioCommand from '../commands/rastreio.js';
import instagramCommand from '../commands/instagram.js';

export default async function messageHandler(message, client) {
    if (message.body === '!ping') {
        pingCommand(message);
    } else if (message.body === 'f!s') {
        await stickerCommand(message);
    } else if (message.body === 'f!i') {
        await imageCommand(message);
    } else if (message.body === 'f!aram') {
        await aramCommand(message, client);
    } else if (message.body === 'f!play') {
        await playCommand(message, client);
    } else if (message.body === 'f!bicho') {
        await fbichoCommand(message);
    } else if (message.body.startsWith('f!rastreio ')) {
        await rastreioCommand(message);
    } else if (message.body.startsWith('f!instagram ')) {
        await instagramCommand(message);
    }
};