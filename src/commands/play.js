export default async function playCommand(msg, client) {
    try {
        const chat = await msg.getChat();

        if (!chat.isGroup) return msg.reply('Apenas em grupo, amigão!');

        let text = "*🎮 PLAY?*";
        let mentions = [];

        for (let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);

            mentions.push(contact);
        }

        mentions = mentions.map(a => a.id._serialized); // Get only the serializable ids

        await chat.sendMessage(text, { mentions });
    } catch (error) {
        console.log(error);
    }
}