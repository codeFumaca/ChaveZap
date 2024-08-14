import Util from 'whatsapp-web.js/src/util/Util.js';
import { RecievedMessage } from '../../types/RecievedMessages.ts';

import { Message } from 'whatsapp-web.js';

export default async function stickerCommand(msg: Message) {
    try {

        Util.setFfmpegPath(process.env.FFMPEG_PATH);

        let msgAntiga;

        if (msg.hasQuotedMsg) msgAntiga = await msg.getQuotedMessage();
        else msgAntiga = msg;

        if (!msgAntiga.hasMedia) { return msg.reply('Você precisa enviar uma imagem para que eu possa converter em sticker!'); }

        await msg.react('🕣');

        const media = await msgAntiga.downloadMedia();

            let recievedMessage = msg as unknown as RecievedMessage;

        await msg.reply(media, msg.from, {
            sendMediaAsSticker: true,
            stickerAuthor: `Solicitante: ${recievedMessage._data.notifyName}`,
            stickerName: `ChaveZAP`
        });
        await msg.react('👍');

    } catch (error) {
        console.log(error);
    }
}