import { Client, GroupChat, Message } from "whatsapp-web.js";

export async function everyoneCommand(msg: Message, client: Client) {
    try {
        const chat = await msg.getChat();

        let text: string = "*@everyone*";
        let mentions = [];

        if (chat.isGroup) {
            const groupChat = chat as GroupChat;
            for (let participant of await groupChat.participants) {
                const contact = await client.getContactById(participant.id._serialized);

                mentions.push(contact);
            }
        } else return msg.reply('Apenas em grupo, amigão!');

        mentions: [] = mentions.map(a => a.id._serialized);
        
        await chat.sendMessage(text, { mentions });
    } catch (error) {
        msg.react('❌')
        msg.reply('Erro ao executar o comando!')
        console.log(error);
    }
}

export async function playCommand(msg: Message, client: Client) {
    try {
        const chat = await msg.getChat();

        let text: string = "*🎮 PLAY?*";
        let mentions = [];

        if (chat.isGroup) {
            const groupChat = chat as GroupChat;
            for (let participant of await groupChat.participants) {
                const contact = await client.getContactById(participant.id._serialized);

                mentions.push(contact);
            }
        } else return msg.reply('Apenas em grupo, amigão!');

        mentions: [] = mentions.map(a => a.id._serialized);
        await chat.sendMessage(text, { mentions });
    } catch (error) {
        msg.react('❌')
        msg.reply('Erro ao executar o comando!')
        console.log(error);
    }
}

export async function aramCommand(msg: Message, client: Client) {
    try {
        const chat = await msg.getChat();

        let text = "*aram🌹?*";
        let mentions = [];

        if (chat.isGroup) {
            const groupChat = chat as GroupChat;
            for (let participant of await groupChat.participants) {
                const contact = await client.getContactById(participant.id._serialized);

                mentions.push(contact);
            }
        } else return msg.reply('Apenas em grupo, amigão!');

        mentions: [] = mentions.map(a => a.id._serialized);
        await chat.sendMessage(text, { mentions });
    } catch (error) {
        msg.react('❌')
        msg.reply('Erro ao executar o comando!')
        console.log(error);
    }
}