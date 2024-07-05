import { Client, Message } from "whatsapp-web.js";
import Schedule from "../../models/schedule.model.ts";
import { RecievedMessage } from "../../@types/RecievedMessages.ts";
import { role, schedule } from "../../@types/types.ts";
import { InsufficientPermissionError, MissingParameterError } from "../../@types/Error.ts";

const COMMANDS: any = {
    'criar': createSchedule, // Criar uma nova escala
    'listar': showSchedule, // Listar funções na escala
    'registrar': registerInSchedule, // Se registrar na escala
    'desregistrar': unregisterInSchedule, // Se desregistrar na escala
    'deletar': deleteSchedule, // Deletar uma escala
    'cadastrar': setTasksInSchedule, // Cadastrar funções na escala
    'estado': modifyStateSchedule, // 

};

const prefix = process.env.PREFIX;

export default async function scheduleCommand(msg: Message, client: Client) {
    try {
        await msg.react('🕣');

        const option = msg.body.split(' ')[1];
        const command = COMMANDS[option];

        if (command) {
            await command(msg, client);
        } else {
            await msg.react('❓');
            return await msg.reply('Nenhuma opção encontrada.\nEscolha uma opção: <criar | cadastrar | listar | registrar | desregistrar | estado | deletar>')
        }
    } catch (error) {
        if (error instanceof Error) handleError(error, msg);
    }
}

async function createSchedule(msg: Message) {
    const id = msg.body.replace('escala criar ', '');

    if (!id || !(id.length > 0)) throw new MissingParameterError();

    const existingSchedule = await Schedule.findOne({ id });
    if (existingSchedule) return await msg.reply(`Já existe uma escala com este identificador.\nUse _${prefix}escala listar ${id}_ para visualizar.`);

    const tasks: role[] = [];

    const schedule = new Schedule({ id, tasks, registered: [] });

    schedule.save().then(async () => await msg.reply('Escala criada com sucesso!'));

    return await msg.react('👍');

}

async function setTasksInSchedule(msg: Message) {
    msg.body = msg.body.replace('escala cadastrar', '')
    const id = msg.body.split(' ')[1];

    const schedule = await Schedule.findOne({ id, isOpen: true, tasks: [] });
    if (!schedule) {
        await msg.react('❌');
        return await msg.reply(`Não há nenhuma escala que atenda aos requisitos.\nUse _${prefix}escala criar_ para criar uma nova escala.`);
    }

    const tasksString = msg.body.split(' ')[2].toLowerCase();
    if (!tasksString) return await msg.reply('Formato de tarefa inválido.');

    const scheduleParts = tasksString.split('//');
    let tasks: role[] = [];

    for (const part of scheduleParts) {
        const [task, quantityStr] = part.split(':');
        const quantity = parseInt(quantityStr);

        if (isNaN(quantity) || quantity <= 0) {
            await msg.react('❌');
            return await msg.reply(`Quantidade inválida para a tarefa: _${task}_.`);
        }

        for (let i = 1; i <= quantity; i++) {
            const obj: role = {
                nome: `${task} ${i}`,
                resp: null,
                numero: null
            };
            tasks.push(obj);
        }
    }

    schedule.tasks.push(...tasks);

    try {
        await schedule.save();
        await msg.react('👍');
        return await msg.reply('Tarefas cadastradas com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar a escala:', error);
        return await msg.reply('Erro ao atualizar a escala.');
    }
}

async function showSchedule(msg: Message) {
    const id = msg.body.replace('escala listar', '').trim();

    if (!id) return await showAllSchedules(msg);

    const emojiTexts: any = {
        'live': '💻 live',
        'som': '🔊 som',
        'fotos': '📸 fotos',
        'storymaker': '📱 storymaker',
        'videomaker': '🎥 videomaker',
        'avisos': '📢 avisos',
    };

    const existingSchedule = await Schedule.findOne({ id });
    if (!existingSchedule) return await msg.reply(`Não há nenhuma escala aberta com este id.\nUse _${prefix}escala criar_ para criar uma nova escala.`);

    const schedule: role[] = existingSchedule.tasks as unknown as role[];
    let message = `*📃 Escala* _${id}_\n`;

    if (existingSchedule.tasks.length === 0) message += '\nNenhuma função cadastrada.';

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

async function registerInSchedule(msg: Message) {
    msg.body = msg.body.replace('escala registrar ', '')

    const id = msg.body.split(' ')[0];
    msg.body = msg.body.replace(id + ' ', '');

    let respNumber: string = msg.from.replace('@c.us', '');

    if (msg.author) respNumber = msg.author.replace('@c.us', '');

    const task = msg.body;
    const existingSchedule: schedule | null = await Schedule.findOne({ id });

    // Validações
    if (!existingSchedule) return await msg.reply(`Não há nenhuma escala com o _ID_ informado.\nUse _${prefix}escala criar_ ou aguarde uma nova escala.`);

    const tasksNames = existingSchedule.tasks.map((item) => item.nome);

    if (!tasksNames) return await msg.reply('Não há nenhuma função cadastrada na escala.');

    if (!tasksNames.includes(task)) return await msg.reply('Função não encontrada na escala.');

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

    await Schedule.updateOne({ id }, { tasks: existingSchedule.tasks, registered: existingSchedule.registered });

    await msg.reply('Registrado com sucesso!');
    return await msg.react('👍');
}

async function unregisterInSchedule(msg: Message) {

    const id = msg.body.replace('escala desregistrar ', '');

    if (!id) throw new MissingParameterError();

    let respNumber: string = msg.from.replace('@c.us', '');

    if (msg.author) respNumber = msg.author.replace('@c.us', '');

    const existingSchedule: schedule | null = await Schedule.findOne({ id });
    if (!existingSchedule) return await msg.reply(`Não há nenhuma escala aberta para esta semana.\nUse _${prefix}escala criar_ para criar uma nova escala.`);
    if (!existingSchedule.registered.includes(respNumber)) return await msg.reply('Você não está registrado na escala.');

    existingSchedule.tasks.map((item) => {
        if (item.numero === respNumber) {
            item.resp = null;
            item.numero = null;
            existingSchedule.registered.splice(existingSchedule.registered.indexOf(respNumber), 1);
        }
    });

    await Schedule.updateOne({ id }, { tasks: existingSchedule.tasks, registered: existingSchedule.registered });

    await msg.reply('Desregistrado com sucesso!');
    return await msg.react('👍');
}

async function deleteSchedule(msg: Message) {
    const secret = process.env.SCHEDULE_SECRET;

    msg.body = msg.body.replace('escala deletar', '');
    const id = msg.body.split(' ')[1];
    const secretMSG = msg.body.split(' ')[2];

    if (!id || !secretMSG || !secret) throw new MissingParameterError();
    if (secretMSG != secret) throw new InsufficientPermissionError();

    await Schedule.deleteOne({ id }).then(async () => await msg.reply('Escala deletada com sucesso!'));

    return await msg.react('👍');
}

async function handleError(error: Error, msg: Message) {
    if (error instanceof InsufficientPermissionError || error instanceof MissingParameterError) {
        await msg.react('❌');
        return msg.reply(error.message);
    }
    if (error instanceof Error) msg.reply(error.message);
    await msg.react('❌');
    return msg.reply('Algo deu errado, tente novamente.');
}

async function showAllSchedules(msg: Message) {
    const schedules = await Schedule.find({ isOpen: true });
    if (!schedules.length) {
        await msg.react('❌');
        return await msg.reply('Não há nenhuma escala aberta.');
    }

    const schedulesIds = schedules.map((item) => item.id);

    await msg.reply(`Escalas abertas: ${schedulesIds}`);
    return await msg.react('👍');
}

async function modifyStateSchedule(msg: Message) {
    const secret = process.env.SCHEDULE_SECRET;

    msg.body = msg.body.replace('escala estado', '');
    const id = msg.body.split(' ')[1];
    const secretMSG = msg.body.split(' ')[2];

    if (!id || !secretMSG || !secret) throw new MissingParameterError();
    if (secretMSG != secret) throw new InsufficientPermissionError();

    const existingSchedule = await Schedule.findOne({ id });

    if (!existingSchedule) return await msg.reply('Escala não encontrada.');

    if (existingSchedule.isOpen) {
        existingSchedule.isOpen = false;
        await msg.reply('Escala fechada com sucesso.');
    } else {
        existingSchedule.isOpen = true;
        await msg.reply('Escala aberta com sucesso.');
    }

    await existingSchedule.save();

    return await msg.react('👍');
}
