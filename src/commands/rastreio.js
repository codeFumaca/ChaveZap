import axios from "axios";

const API_URL = "https://api.linketrack.com/track/json?user=teste&token=1abcd00b2731640e886fb41a8a9671ad1434c599dbaa0a0de9a5aa619f29a83f&codigo=";

export default async function rastreioCommand(msg) {
    try {
        const codigoRastreio = msg.body.split(' ');

        if (!codigoRastreio[1]) {
            return msg.reply('Você precisa informar um código de rastreio');
        }

        const info = await getResults(codigoRastreio[1]);

        if (!info.data.eventos[0].status) {
            return msg.reply('Código de rastreio inválido');
        }

        let text = `*Rastreamento Correios*\n_${info.data.codigo}_
        \nÚltima atualização: ${info.data.eventos[0].data}\nHorário: ${info.data.eventos[0].hora} (GMT -3)\nStatus: *${info.data.eventos[0].status}*\nLocal: ${info.data.eventos[0].local}`;

        await msg.reply(text);

    } catch (error) {
        if (error.response && error.response.status === 429) {
            return msg.reply('Muitas requisições, tente novamente mais tarde.');
        }
    }
}

async function getResults(codigoRastreio) {
    const response = await axios.get(`${API_URL}${codigoRastreio}`);
    return response;
}