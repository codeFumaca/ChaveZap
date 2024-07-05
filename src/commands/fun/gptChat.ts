import OpenAI from "openai";
import { Message } from "whatsapp-web.js";

export default async function gptCommand(msg: Message) {

    const prefix = process.env.PREFIX;
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

        const mensagem = msg.body.replace(`gpt `, '');

        await msg.react('🕣');

        const chatGPTResponse = await getGPTResponse(openai, mensagem);

        if (!chatGPTResponse) throw new Error('Não foi possível obter uma resposta do GPT.');

        await msg.reply(chatGPTResponse);
        await msg.react('👍');
    } catch (error: any) {
        await msg.reply(`❌ Ocorreu um erro ao executar o comando.`);
        await msg.react('❌');
    }
}

async function getGPTResponse(openai: OpenAI, message: string) {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: message }],
        model: "gpt-3.5-turbo",
    });

    return completion.choices[0]?.message.content;
} 