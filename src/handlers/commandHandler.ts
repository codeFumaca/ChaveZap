import pingCommand from '../commands/fun/ping.ts';
import stickerCommand from '../commands/fun/sticker.ts';
import imageCommand from '../commands/fun/image.ts';
import bichoCommand from '../commands/fun/bicho.ts';
import rastreioCommand from '../commands/fun/rastreio.ts';
import mediaCommand from '../commands/fun/media.ts';
import gptCommand from '../commands/fun/gptChat.ts';
import versiculoCommand from '../commands/fun/versiculo.ts';
import log, { logError } from './log.ts';
import { everyoneCommand, playCommand, aramCommand } from '../commands/fun/mentions.ts';
import { Client, Message } from 'whatsapp-web.js';
import withLogging from './log.ts';
import scheduleCommand from '../commands/utility/schedule.ts';

const prefix = process.env.PREFIX;

const commands: any = {
    'gpt': gptCommand,
    'i': imageCommand,
    'ping': pingCommand,
    's': stickerCommand,
    'aram': aramCommand,
    'play': playCommand,
    'bicho': bichoCommand,
    'paz': versiculoCommand,
    'everyone': everyoneCommand,
    'rastreio': rastreioCommand,
    'media': mediaCommand,
    'versiculo': versiculoCommand,
    'escala': scheduleCommand,
};

export default async function commandHandler(message: Message, client: Client) {
    try {
        if (!prefix) throw new Error('Prefixo não definido.');

        if (!message.body.startsWith(prefix)) return;
        if (message.body.startsWith(prefix)) message.body = message.body.replace(prefix, '');
        const command: string = message.body.split(' ')[0];

        if (commands[command]) {

            const commandWithLogging = withLogging(commands[command]);
            await commandWithLogging(message, client);

        } else {
            message.react('❓');
            message.reply(`Comando desconhecido: ${command}`);
        }
    } catch (error) {
        if (error instanceof Error) logError(error, client);
        message.react('❌');
        message.reply('Algo deu errado, tente novamente.');
    }
};