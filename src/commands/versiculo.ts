import * as cheerio from 'cheerio';
import axios from "axios";
import { Message } from 'whatsapp-web.js';

export default async function versiculoCommand(msg: Message) {
    try {
        const option = msg.body.split(' ');

        await msg.react('🕣');

        if (!option[1]) return paz(msg)

        switch (option[1]) {
            case 'anteontem':
                versiculo(msg, '_anteontem')
                break;
            case 'ontem':
                versiculo(msg, '_ontem')
                break;
            case 'hoje':
                versiculo(msg, '_hoje')
                break;
            default:
                await msg.react('❌');
                return await msg.reply('Nenhuma opção encontrada.\nEscolha uma opção: <anteontem | ontem | hoje>\nExemplo: ```f!versiculo hoje```');
        }
    } catch (error) {
        await msg.react('❌');
        return msg.reply('Algo deu errado, tente novamente.');
    }
}

async function versiculo(msg: Message, option: '_anteontem' | '_ontem' | '_hoje') {
    try {
        const versiculo = await getResults(option);

        await msg.react('👍');
        await msg.reply(versiculo);

    } catch (error) {
        await msg.react('❌');
        return msg.reply('Algo deu errado, tente novamente.');
    }

    async function getResults(option: '_anteontem' | '_ontem' | '_hoje') {
        const response = await axios.get(`https://www.bibliaon.com/versiculo_do_dia`);
        if (!response) throw new Error('Algo de errado aconteceu!')
        const $ = cheerio.load(response.data);
        const parte = $(`#versiculo${option}`).text().trim();
        return `${parte}`;
    }
}

async function paz(msg: Message) {
    try {
        const data = await getResults()

        let text = `"${data.text}" \n ${data.book.name} ${data.chapter}:${data.number}`

        await msg.reply(text);
        await msg.react('👍');

    } catch (error) {
        await msg.react('❌');
        return msg.reply('Algo deu errado, tente novamente.');

    }

    async function getResults() {
        const response = await axios.get(`https://www.abibliadigital.com.br/api/verses/nvi/random`);
        if (!response) throw new Error('Algo de errado aconteceu!')
        return response.data;
    }
}