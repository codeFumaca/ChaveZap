import { Message } from "whatsapp-web.js";
import Schedule from "../../models/schedule.model.ts";
import { RecievedMessage } from "../../@types/RecievedMessages.ts";
import { role, schedule } from "../../@types/types.ts";
import { InsufficientPermissionError } from "../../@types/Error.ts";

export default async function scheduleCommand(msg: Message) {
    try {
        await msg.react('🕣');

        const option = msg.body.split(' ')[1];

        switch (option) {
            case 'criar':
                msg.body = msg.body.replace('f!escala criar ', '')
                await createSchedule(msg);
                break;
            case 'listar':
                await showSchedule(msg);
                break;
            case 'registrar':
                msg.body = msg.body.replace('f!escala registrar ', '')
                await registerInSchedule(msg);
                break;
            case 'desregistrar':
                await unregisterInSchedule(msg);
                break;
            case 'deletar':
                await deleteSchedule(msg);
                break;
            default:
                await msg.react('❓');
                return await msg.reply('Nenhuma opção encontrada.\nEscolha uma opção: <criar | listar | registrar | desregistrar | deletar>')
        }
    } catch (error) {
        if (error instanceof InsufficientPermissionError) {
            await msg.react('❌');
            return msg.reply(error.message);
        }
        await msg.react('❌');
        return msg.reply('Algo deu errado, tente novamente.');
    }
}

async function createSchedule(msg: Message) {
    const tasksString = msg.body.trim();

    const now = new Date();
    const week = getWeek(now);
    const year = now.getFullYear();

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
    try {
        const now = new Date();
        const week = getWeek(now);
        const year = now.getFullYear();

        const existingSchedule = await Schedule.findOne({ week, year });
        if (!existingSchedule) return await msg.reply('Não há nenhuma escala aberta para esta semana.\nUse ```f!escala criar``` para criar uma nova esacala.');

        const schedule: role[] = existingSchedule.tasks as unknown as role[];
        let message = `Escala da Semana ${week} de ${year}\n`;

        for (const scheduleItem of schedule) {
            message += `\n*${scheduleItem.nome}* - ${scheduleItem.resp || '_Vago_'} - ${scheduleItem.numero || '_Vago_'}`;
        }

        await msg.reply(message);
        return await msg.react('👍');

    } catch (error) {
        await msg.react('❌');
        return msg.reply('Algo deu errado, tente novamente.');
    }
}

async function registerInSchedule(msg: Message) {
    const now = new Date();
    const week = getWeek(now);
    const year = now.getFullYear();

    const respNumber: string = msg.from.replace('@c.us', '');

    const existingSchedule: schedule | null = await Schedule.findOne({ week, year });
    if (!existingSchedule) return await msg.reply('Não há nenhuma escala aberta para esta semana.\nUse ```f!escala criar``` para criar uma nova esacala.');

    const task = msg.body;

    if (existingSchedule.registered.includes(respNumber)) return await msg.reply('Você já está registrado na escala.');

    const tasksNames = existingSchedule.tasks.map((item) => item.nome);

    const recievedMessage = msg as unknown as RecievedMessage;

    existingSchedule.tasks.map((item) => {
        if (item.nome === task && !item.resp) {
            item.resp = recievedMessage._data.notifyName;
            item.numero = recievedMessage.from.replace('@c.us', '');
            existingSchedule.registered.push(recievedMessage.from.replace('@c.us', ''));
        }
    });

    await Schedule.updateOne({ week, year }, { tasks: existingSchedule.tasks, registered: existingSchedule.registered });

    await msg.reply('Registrado com sucesso!');
    return await msg.react('👍');

}

async function unregisterInSchedule(msg: Message) {
    const now = new Date();
    const week = getWeek(now);
    const year = now.getFullYear();

    const respNumber: string = msg.from.replace('@c.us', '');

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

    await msg.reply('Desegistrado com sucesso!');
    return await msg.react('👍');
}

async function deleteSchedule(msg: Message) {
    const secret = process.env.SCHEDULE_SECRET;
    const secretMSG = msg.body.replace('f!escala deletar ', '');

    if (secretMSG !== secret) throw new InsufficientPermissionError();

    const now = new Date();
    const week = getWeek(now);
    const year = now.getFullYear();

    await Schedule.deleteOne({ week, year });

    await msg.reply('Escala deletada com sucesso!');
    return await msg.react('👍');
}

function getWeek(date: Date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}