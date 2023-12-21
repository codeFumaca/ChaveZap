export default async function aramCommand(msg, client) {
    try {
        const chat = await msg.getChat();

        if (!chat.isGroup) return msg.reply('Apenas em grupo, amigão!');

        let text = "*aram🌹?*";
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