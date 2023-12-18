import pingCommand from '../commands/ping.js';
import stickerCommand from '../commands/sticker.js';
import imageCommand from '../commands/image.js';

export default async function messageHandler(message) {
    if (message.body === '!ping') {
        pingCommand(message);
    } else if (message.body === 'f!s') {
        await stickerCommand(message);
    } else if (message.body === 'f!i') {
        await imageCommand(message);
    }
};