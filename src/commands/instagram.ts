import axios from "axios";
import { Message } from "whatsapp-web.js";

import whatsappWeb from "whatsapp-web.js";
import { MissingParameterError } from "../@types/Error.ts";
const MessageMedia = whatsappWeb.MessageMedia;

export default async function instagramCommand(msg: Message) {
    try {
        await msg.react('🕣');
        const op = msg.body.split(' ')[1];
        const url = msg.body.split(' ')[2];

        switch (op) {
            case 'image':
            case 'video':
            case 'igtv':
            case 'reels':
                return await instagramMediaDownloader(msg, url, 'post');
            case 'storie':
                return await instagramMediaDownloader(msg, url, 'stories');
            default:
                await msg.react('❌');
                return await msg.reply('Nenhuma opção encontrada.\nEscolha uma opção: <image | video | igtv | reels | storie>\nExemplo: ```f!instagram image https://www.instagram.com/p/...```');
        }
    } catch (error: any) {
        await msg.reply(`Ocorreu um erro: _*${error.message}*_`);
        await msg.react('❌');
    }
}

async function instagramMediaDownloader(msg: Message, url: string, type: string) {
    try {
        if(!url) throw new MissingParameterError();

        const linkDownload = await getResults(url, type);

        const media = await MessageMedia.fromUrl(linkDownload);

        await msg.reply(media);

        return await msg.react('👍');
    } catch (error: any) {
        await msg.reply(`Ocorreu um erro: _*${error.message}*_`);
        await msg.react('❌');
    }

    async function getResults(linkPost: string, type: string) {
        const options = {
            method: 'GET',
            url: `https://instagram-media-downloader.p.rapidapi.com/rapid/${type}.php`,
            params: {
                url: linkPost
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'instagram-media-downloader.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        if (!response.data.video) return response.data.image;
        return response.data.video;
    }
}