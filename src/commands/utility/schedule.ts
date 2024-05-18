import { Client, Message } from "whatsapp-web.js";
import Schedule from "../../models/schedule.model.ts";
import { RecievedMessage } from "../../@types/RecievedMessages.ts";
import { role, schedule } from "../../@types/types.ts";
import { InsufficientPermissionError } from "../../@types/Error.ts";

const COMMANDS: any = {
    'criar': createSchedule,
    'listar': showSchedule,
    'registrar': registerInSchedule,
    'desregistrar': unregisterInSchedule,
    'deletar': deleteSchedule
};

export default async function scheduleCommand(msg: Message, client: Client) {
    try {
        await msg.react('🕣');

        const option = msg.body.split(' ')[1];
        const command = COMMANDS[option];

        if (command) {
            await command(msg, client);
        } else {
            await msg.react('❓');
            return await msg.reply('Nenhuma opção encontrada.\nEscolha uma opção: <criar | listar | registrar | desregistrar | deletar>')
        }
    } catch (error) {
        if (error instanceof Error) handleError(error, msg);
    }
}

async function createSchedule(msg: Message) {
    msg.body = msg.body.replace('f!escala criar ', '')

    const tasksString = msg.body.trim();

    const [week, year] = getWeekAndYear();

    const existingSchedule = await Schedule.findOne({ week, year });
    if (existingSchedule) return await msg.reply('Já existe uma escala para esta semana.\nUse ```f!escala listar``` para visualizar.');

    const scheduleParts = tasksString.split('//');

    let tasks: role[] = [];

    for (const part of scheduleParts) {
        const [task, quantity] = part.split(':');

        for (let i = 1; i <= parseInt(quantity); i++) {
            const obj: role = {
                nome: `${task} ${i}`,
                resp: null,
                numero: null
            }
            tasks.push(obj);
        }
    }

    const schedule = new Schedule({ week, year, tasks });

    await schedule.save();

    await msg.reply('Escala criada com sucesso!');
    return await msg.react('👍');

}

async function showSchedule(msg: Message) {
    const [week, year] = getWeekAndYear();

    const emojiTexts: any = {
        'live': '💻 live',
        'som': '🔊 som',
        'fotos': '📸 fotos',
        'storymaker': '📱 storymaker',
        'videomaker': '🎥 videomaker',
        'avisos': '📢 avisos',
    };

    const existingSchedule = await Schedule.findOne({ week, year });
    if (!existingSchedule) return await msg.reply('Não há nenhuma escala aberta para esta semana.\nUse ```f!escala criar``` para criar uma nova esacala.');

    const schedule: role[] = existingSchedule.tasks as unknown as role[];
    let message = `Escala da Semana ${week} de ${year}\n`;

    for (const scheduleItem of schedule) {
        if (scheduleItem.nome) {
            const [taskName, taskNumber] = scheduleItem.nome.split(' ');
            let emojiName;
            emojiName = emojiTexts[taskName] ?? scheduleItem.nome;
            message += `\n*${emojiName} ${taskNumber}* - ${scheduleItem.resp || '_Vago_'} - ${scheduleItem.numero || '_Vago_'}`
        }
    }

    await msg.reply(message);
    return await msg.react('👍');
}

async function registerInSchedule(msg: Message, client: Client) {
    msg.body = msg.body.replace('f!escala registrar ', '')

    const [week, year] = getWeekAndYear();

    let respNumber: string = msg.from.replace('@c.us', '');

    if (msg.author) respNumber = msg.author.replace('@c.us', '');

    const task = msg.body;

    const existingSchedule: schedule | null = await Schedule.findOne({ week, year });

    // Validações
    if (!existingSchedule) return await msg.reply('Não há nenhuma escala aberta para esta semana.\nUse ```f!escala criar``` ou aguarde uma nova escala.');

    const tasksNames = existingSchedule.tasks.map((item) => item.nome); 
    if (tasksNames.includes(task) === false) return await msg.reply('Essa função não existe na escala.');

    if (existingSchedule.registered.includes(respNumber)) return await msg.reply('Você já está registrado na escala.');

    if (existingSchedule.tasks.filter((item) => item.nome === task)[0].resp) return await msg.reply('Essa função já está preenchida.');

    // Registro
    const recievedMessage = msg as unknown as RecievedMessage;

    existingSchedule.tasks.map((item) => {
        if (item.nome === task) {
            item.resp = recievedMessage._data.notifyName;
            item.numero = respNumber;
            existingSchedule.registered.push(respNumber);
        }
    });

    await Schedule.updateOne({ week, year }, { tasks: existingSchedule.tasks, registered: existingSchedule.registered });

    await msg.reply('Registrado com sucesso!');
    return await msg.react('👍');
}

async function unregisterInSchedule(msg: Message) {
    const [week, year] = getWeekAndYear();

    let respNumber: string = msg.from.replace('@c.us', '');

    if (msg.author) respNumber = msg.author.replace('@c.us', '');

    const existingSchedule: schedule | null = await Schedule.findOne({ week, year });
    if (!existingSchedule) return await msg.reply('Não há nenhuma escala aberta para esta semana.\nUse ```f!escala criar``` para criar uma nova esacala.');
    if (!existingSchedule.registered.includes(respNumber)) return await msg.reply('Você não está registrado na escala.');

    existingSchedule.tasks.map((item) => {
        if (item.numero === respNumber) {
            item.resp = null;
            item.numero = null;
            existingSchedule.registered.splice(existingSchedule.registered.indexOf(respNumber), 1);
        }
    });

    await Schedule.updateOne({ week, year }, { tasks: existingSchedule.tasks, registered: existingSchedule.registered });

    await msg.reply('Desregistrado com sucesso!');
    return await msg.react('👍');
}

async function deleteSchedule(msg: Message) {
    const secret = process.env.SCHEDULE_SECRET;
    const secretMSG = msg.body.replace('f!escala deletar ', '');

    if (secretMSG !== secret) throw new InsufficientPermissionError();

    const [week, year] = getWeekAndYear();

    await Schedule.deleteOne({ week, year });

    await msg.reply('Escala deletada com sucesso!');
    return await msg.react('👍');
}

async function handleError(error: Error, msg: Message) {
    if (error instanceof InsufficientPermissionError) {
        await msg.react('❌');
        return msg.reply(error.message);
    }
    if (error instanceof Error) msg.reply(error.message);
    await msg.react('❌');
    return msg.reply('Algo deu errado, tente novamente.');
}

function getWeek(date: Date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getWeekAndYear() {
    const now = new Date();
    const week = getWeek(now);
    const year = now.getFullYear();
    return [week, year];
}