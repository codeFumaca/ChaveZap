import pingCommand from '../commands/fun/ping.ts';
import stickerCommand from '../commands/fun/sticker.ts';
import imageCommand from '../commands/fun/image.ts';
import bichoCommand from '../commands/fun/bicho.ts';
import rastreioCommand from '../commands/fun/rastreio.ts';
import instagramCommand from '../commands/fun/instagram.ts';
import gptCommand from '../commands/fun/gptChat.ts';
import versiculoCommand from '../commands/fun/versiculo.ts';
import log, { logError } from './log.ts';
import { everyoneCommand, playCommand, aramCommand } from '../commands/fun/mentions.ts';
import { Client, Message } from 'whatsapp-web.js';
import withLogging from './log.ts';
import scheduleCommand from '../commands/utility/schedule.ts';

const commands: any = {
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
    'f!escala': scheduleCommand,
};

export default async function commandHandler(message: Message, client: Client) {

    message.body = message.body.toLocaleLowerCase();

    if (!message.body.startsWith('f!')) return;

    const command: string = message.body.split(' ')[0];

    if (commands[command]) {
        try {
            const commandWithLogging = withLogging(commands[command]);
            await commandWithLogging(message, client);
        } catch (error) {
            if (error instanceof Error) logError(error, client);
            message.react('❌');
            message.reply('Algo deu errado, tente novamente.');
        }
    } else {
        message.react('❓');
        message.reply(`Comando desconhecido: ${command}`);
    }
};