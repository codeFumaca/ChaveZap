import axios from "axios";
import { Message } from "whatsapp-web.js";

import whatsappWeb from "whatsapp-web.js";
import { MissingParameterError } from "../../types/Error.ts";
import FormData from "form-data";

import { YouTubeMedia } from "../../types/types.ts";

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

        const media = await MessageMedia.fromUrl(linkDownload, { unsafeMime: true });

        return media;

    } catch (error: any) {
        await msg.reply(`Ocorreu um erro: _*${error.message}*_`);
        await msg.react('❌');
    }
}

async function getResults(linkPost: string) {
    const data = new FormData();
    data.append('url', `${linkPost}`);

    const options = {
        method: 'POST',
        url: 'https://all-media-downloader.p.rapidapi.com/download',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'all-media-downloader.p.rapidapi.com',
            ...data.getHeaders(),
        },
        data: data
    };

    try {
        const response = await axios.request(options);
        if (response.data.audio) return extractMediaInfo(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

function extractMediaInfo(media: YouTubeMedia) {
    const video360pUrl = media["360p"].url;
    const audioUrl = media.audio.url;

    return video360pUrl;
}