import { Client, Message } from "whatsapp-web.js";
import { RecievedMessage } from "../@types/RecievedMessages.ts";

export default function withLogging(commandFunc: (msg: Message, client: Client) => Promise<void>) {
    return async function(msg: Message, client: Client) {
        const groupId = process.env.LOGCHANNEL_ID;

        if (!groupId) return console.log('Log channel not found');

        const groupChat = await client.getChatById(groupId);
        
        let recievedMessage = msg as unknown as RecievedMessage;
        let text = `📢 *Novo comando executado!*\nSolicitante: ${recievedMessage._data.notifyName}\nComando: ${commandFunc.name}`;

        await groupChat?.sendMessage(text);

        return commandFunc(msg, client);
    }
}