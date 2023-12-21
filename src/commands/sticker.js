export default async function stickerCommand(msg) {
    try {
        let msgAntiga;

        if (msg.hasQuotedMsg) {
            msgAntiga = await msg.getQuotedMessage();
        } else {
            msgAntiga = msg;
        }

        if (!msgAntiga.hasMedia) {
            return msg.reply('Você precisa enviar uma imagem para que eu possa converter em sticker!');
        }
        await msg.react('🕣');

        const media = await msgAntiga.downloadMedia();
        await msg.reply(media, msg.from, {
            sendMediaAsSticker: true,
            stickerAuthor: `Solicitante: ${msg._data.notifyName}`,
            stickerName: `ChaveZAP`
        });
        await msg.react('👍');

    } catch (error) {
        console.log(error);
    }
}