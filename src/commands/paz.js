import axios from "axios";

export default async function pazCommand(msg) {
    try {
        await msg.react('🕣');

        const data = await getResults()

        let text = `"${data.text}" \n ${data.book.name} ${data.chapter}:${data.number}`

        await msg.reply(text);
        await msg.react('👍');

    } catch (error) {
        if (error.response || error.response.status === 429) {
            await msg.react('❌');
            return msg.reply('Algo deu errado, tente novamente.');  
        }
    }
}

async function getResults() {
    const response = await axios.get(`https://www.abibliadigital.com.br/api/verses/nvi/random`);
    if (!response) throw new Error('Algo de errado aconteceu!')
    return response.data;
}