import axios, { AxiosError } from "axios";
import { Message } from "whatsapp-web.js";
import { MissingParameterError, UnsupportedTrackingCodeError } from "../@types/Error.ts";

const API_URL = process.env.API_URL;

export default async function rastreioCommand(msg: Message) {
    try {
        await msg.react('🕣');

        const codigoRastreio = msg.body.split(' ')[1];

        if (!codigoRastreio) throw new MissingParameterError();

        const info = await getResults(codigoRastreio);

        if (info.eventos.length === 0) throw new UnsupportedTrackingCodeError();

        let text = `*Rastreamento Correios*\n_${info.codigo}_
        \nÚltima atualização: ${info.eventos[0].data}\nHorário: ${info.eventos[0].hora} (GMT -3)\nStatus: *${info.eventos[0].status}*\nLocal: ${info.eventos[0].local}\nFornecedor da API: https://linketrack.com/`;
        
        await msg.reply(text);
        await msg.react('👍');

    } catch (error: any) {
        if (error instanceof AxiosError) {
            await msg.react('❌');
            return msg.reply('Muitas requisições, tente novamente mais tarde.');
        }
        if (error instanceof MissingParameterError || error instanceof UnsupportedTrackingCodeError) {
            await msg.react('❌');
            return msg.reply(error.message);
        }
    }
}

async function getResults(codigoRastreio: string) {
    const response = await axios.get(`${API_URL}${codigoRastreio}`);
    if (!response) throw new Error('Algo de errado aconteceu!')
    return response.data;
}