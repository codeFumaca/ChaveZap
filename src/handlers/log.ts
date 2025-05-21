import { Client, Message } from "whatsapp-web.js";
import { RecievedMessage } from "../types/RecievedMessages.ts";

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
        if (msgAnterior.hasMedia) {
            const cont1 = await msgAnterior.downloadMedia();
            return await groupChat.sendMessage(cont1, { caption: `❌ *Mensagem apagada!*\nRemetente: ${lastMessage._data.notifyName}\nConteúdo: ${msg.body}` });
        }

        if (msg.hasMedia) {
            const cont2 = await msg.downloadMedia();
            return await groupChat.sendMessage(cont2, { caption: `❌ *Mensagem apagada!*\nRemetente: ${lastMessage._data.notifyName}\nConteúdo: ${msg.body}` });
        }

        const text = `❌ *Mensagem apagada!*\nRemetente: ${lastMessage._data.notifyName}\nConteúdo: ${msg.body}`;

        await groupChat.sendMessage(text);
    } catch (error) {
        if (error instanceof Error) await logError(error, client);
    }
}

export async function editedLogMessage(msgAnterior: string, msgNova: string, message: Message, client: Client) {
    try {
        const groupId = process.env.LOGCHANNEL_ID;

        if (!groupId) return;

        const groupChat = await client.getChatById(groupId);

        const messageoptions = message as unknown as RecievedMessage;

        const text = `✏️ *Mensagem editada!*\nConteúdo anterior: ${msgAnterior}\nConteúdo novo: ${msgNova}, \nRemetente: ${messageoptions._data.notifyName}`;

        await groupChat.sendMessage(text);
    } catch (error) {
        if (error instanceof Error) await logError(error, client);
    }
}