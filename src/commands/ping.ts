import { Message } from "whatsapp-web.js";

export default async function pingCommand(message:Message) {
    const start = new Date(message.timestamp * 1000).getTime();
    const end = Date.now();
    return await message.reply(`Tempo de resposta: ${end - start} ms`);
};