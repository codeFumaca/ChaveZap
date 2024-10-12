import { Client, GroupChat, Message } from "whatsapp-web.js";

export async function mentionCommand(msg: Message, client: Client) {
    try {
        const chat = await msg.getChat();
        let text: string = "";

        if (msg.body == "everyone") text = "*@everyone*";
        if (msg.body == "play") text = "*🎮 PLAY?*";
        if (msg.body == "aram") text = "*aram🌹?*";

        if (chat.isGroup) {
            const groupChat = chat as GroupChat;

            const mentions = await groupChat.participants.map(a => a.id._serialized);

            await chat.sendMessage(text, { mentions });
        } else return msg.reply('Apenas em grupo, amigão!');
    } catch (error) {
        msg.react('❌')
        msg.reply('Erro ao executar o comando!')
        console.log(error);
    }
}