import axios from "axios";

const API_URL = "https://loteriascaixa-api.herokuapp.com/api/federal/latest";

export default async function fbichoCommand(msg) {
    try {
        const info = await getResults();
        let text = `*Resultado Federal _${info.data.concurso}_*
        _${info.data.data}_\n\n*1º* Prêmio: ${info.data.dezenas[0]}\n*2º* Prêmio: ${info.data.dezenas[1]}\n*3º* Prêmio: ${info.data.dezenas[2]}\n*4º* Prêmio: ${info.data.dezenas[3]}\n*5º* Prêmio: ${info.data.dezenas[4]}`;

        await msg.reply(text);

    } catch (error) {
        console.log(error);
    }
}

async function getResults() {
    const response = await axios.get(`${API_URL}`);
    return response;
}