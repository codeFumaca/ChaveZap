export default async function pingCommand(message) {
    const start = Date.parse(Date(message.timestamp));
    const end = Date.now();
    return await message.reply(`Tempo de resposta: ${end - start} ms`);
};