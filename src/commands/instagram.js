import axios from "axios";
import MessageMedia from "whatsapp-web.js/src/structures/MessageMedia.js";

export default async function instagramCommand(msg) {
    try {
        const linkInsta = msg.body.split(' ');

        if (!linkInsta[1]) return msg.reply('Você precisa informar um link para que eu possa baixar!');

        await msg.react('🕣');

        const linkDownload = await getResults(linkInsta[1]);

        const media = await MessageMedia.fromUrl(linkDownload);

        await msg.reply(media, msg.from);

        await msg.react('👍');

    } catch (error) {
        await msg.reply(`Ocorreu um erro: _*${error.message}*_`);
        await msg.react('❌');
    }
}

async function getResults(linkInsta) {

    const options = {
        method: 'GET',
        url: 'https://instagram-media-downloader.p.rapidapi.com/rapid/post.php',
        params: {
            url: linkInsta
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