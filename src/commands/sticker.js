export default async function stickerCommand(msg) {
    let msgAntiga;

    if (msg.hasQuotedMsg) {
        msgAntiga = await msg.getQuotedMessage();
    } else {
        msgAntiga = msg;
    }

    if (!msgAntiga.hasMedia) {
        return msg.reply('Você precisa enviar uma imagem para que eu possa converter em sticker!');
    }

    try {
        await msg.react('🕣');

        setTimeout(async () => {
            const media = await msgAntiga.downloadMedia();
            await msg.reply(media, msg.from, {
                sendMediaAsSticker: true,
                stickerAuthor: `Solicitou: ${msg._data.notifyName}`,
                stickerName: `ChaveZAP`
            });
            await msg.react('👍');
        }, 2000);

    } catch (error) {
        console.log(error);
    }
}