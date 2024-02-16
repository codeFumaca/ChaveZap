import OpenAI from "openai";

export default async function gptCommand(msg) {

    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

        const mensagem = msg.body.replace('f!gpt ', '');

        await msg.react('🕣');

        const chatGPTResponse = await getGPTResponse(openai, mensagem);

        await msg.reply(chatGPTResponse);
    } catch (error) {
        await msg.reply(`Ocorreu um erro: _*${error.message}*_`);
        await msg.react('❌');
    }
}

async function getGPTResponse(openai, message) {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: message }],
        model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content;
} 