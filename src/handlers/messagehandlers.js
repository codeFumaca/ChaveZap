import pingCommand from '../commands/ping.js';
import stickerCommand from '../commands/sticker.js';
import imageCommand from '../commands/image.js';
import aramCommand from '../commands/aram.js';
import playCommand from '../commands/play.js';

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
    }
};