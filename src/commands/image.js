export default async function imageCommand(msg) {
    try {
        await msg.react('🕣');

        let media;

        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            media = await quotedMsg.downloadMedia();
        } else if (msg.hasMedia) {
            media = await msg.downloadMedia();
        } else {
            return msg.reply('Nenhuma mensagem citada ou mídia encontrada.');
        }

        await msg.reply(media, msg.from);
        await msg.react('👍');
    } catch (error) {
        console.log(error);
    }
}

