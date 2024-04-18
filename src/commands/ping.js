export default async function pingCommand(message) {
    const start = Date.now();
    const end = Date.now();

    const responseTime = end - start;
    return await message.reply(`Tempo de resposta: ${responseTime} ms`);
};