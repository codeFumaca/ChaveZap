export default async function log(msg, client) {
    const groupId = process.env.LOGCHANNEL_ID;
    const groupChat = await client.getChatById(groupId);
    let sender = msg._data.from.split('@')[0];
    let text = 
    `> Novo comando executado!\n> Solicitante: ${msg._data.notifyName} (+${sender})\n> Comando: ${msg.body}`;
    return await groupChat.sendMessage(text);
}