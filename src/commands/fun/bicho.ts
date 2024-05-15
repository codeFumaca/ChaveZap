import axios from "axios";
import { Message } from "whatsapp-web.js";

const API_URL = "https://loteriascaixa-api.herokuapp.com/api/federal/latest";

export default async function bichoCommand(msg:Message) {
    try {
        const info = await getResults();
        let text:string = `*Resultado Federal _${info.concurso}_*
        _${info.data}_\n\n*1º* Prêmio: ${info.dezenas[0]}\n*2º* Prêmio: ${info.dezenas[1]}\n*3º* Prêmio: ${info.dezenas[2]}\n*4º* Prêmio: ${info.dezenas[3]}\n*5º* Prêmio: ${info.dezenas[4]}`;

        await msg.reply(text);

    } catch (error) {
        console.log(error);
    }
}

async function getResults() {
    const response = await axios.get(`${API_URL}`);
    return response.data;
}