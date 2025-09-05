import axios from "axios";
import { Message } from "whatsapp-web.js";

import whatsappWeb from "whatsapp-web.js";
import { MissingParameterError } from "../../types/Error.ts";

const MessageMedia = whatsappWeb.MessageMedia;

export default async function mediaCommand(msg: Message) {
    try {
        await msg.react('🕣');
        const url = msg.body.split(' ')[1];

        const wpmedia = await mediaDownloader(msg, url);

        if (wpmedia) await msg.reply(wpmedia)

        return await msg.react('👍');

    } catch (error: any) {
        await msg.reply(`Ocorreu um erro: _*${error.message}*_`);
        await msg.react('❌');
    }
}

async function mediaDownloader(msg: Message, url: string) {
    try {
        if (!url) throw new MissingParameterError();

        const linkDownload = await getResults(url);

        const media = await MessageMedia.fromUrl(linkDownload?.urlDownload, { unsafeMime: true });

        return media;

    } catch (error: any) {
        await msg.reply(`Ocorreu um erro: _*${error.message}*_`);
        await msg.react('❌');
    }
}

async function getResults(linkPost: string) {
    const options = {
        method: 'POST',
        url: 'https://instagram120.p.rapidapi.com/api/instagram/links',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'instagram120.p.rapidapi.com',
            'Content-Type': 'application/json',
        },
        data: {
            url: linkPost
        }
    };

    try {
        const response = await axios.request(options);
        const result = response.data[0];
        const url = result.urls[0].url;

        return {
            urlDownload: url,
            comments: result.meta.commentCount,
            likes: result.meta.likeCount,
            author: result.meta.username,
        }
    } catch (error) {
        console.error(error);
    }
}