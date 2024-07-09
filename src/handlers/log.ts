import { Client, Message } from "whatsapp-web.js";
import { RecievedMessage } from "../@types/RecievedMessages.ts";

export default async function withLogging(commandFunc: (msg: Message, client: Client) => Promise<void>) {
    return async function (msg: Message, client: Client) {
        const groupId = process.env.LOGCHANNEL_ID;

        if (!groupId) return msg.reply('Log channel not found, contact the developer.');

        const groupChat = await client.getChatById(groupId);

        let recievedMessage = msg as unknown as RecievedMessage;
        let text = `📢 *Novo comando executado!*\nSolicitante: ${recievedMessage._data.notifyName}\nComando: ${commandFunc.name}`;

        await groupChat?.sendMessage(text);

        return await commandFunc(msg, client);
    }
}

export async function logError(error: Error, client: Client) {
    const groupId = process.env.LOGCHANNEL_ID;

    if (!groupId) return;

    const groupChat = await client.getChatById(groupId);

    let text = `❌ *Erro!*\n${error.message}`;

    await groupChat.sendMessage(text);
}

export async function deleteLogMessage(msgAnterior: Message, msg: Message, client: Client) {
    try {
        const groupId = process.env.LOGCHANNEL_ID;

        if (!groupId) return;

        const groupChat = await client.getChatById(groupId);

        const lastMessage = msgAnterior as unknown as RecievedMessage;

        const text = `❌ *Mensagem apagada!*\nRemetente: ${lastMessage._data.notifyName}\nConteúdo: ${msg.body}`;

        await groupChat.sendMessage(text);
    } catch (error) {
        if (error instanceof Error) logError(error, client);
    }
}