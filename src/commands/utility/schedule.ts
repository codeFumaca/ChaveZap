import { Client, Message } from "whatsapp-web.js";
import Schedule from "../../models/schedule.model.ts";
import { RecievedMessage } from "../../types/RecievedMessages.ts";
import { role } from "../../types/types.ts";
import { InsufficientPermissionError, MissingParameterError } from "../../types/Error.ts";
import { db, scheduleSchema } from "database/index.ts";

const COMMANDS: Record<string, Function> = {
    'criar': createSchedule, // Criar uma nova escala
    'listar': showSchedule, // Listar funções na escala
    'registrar': registerInSchedule, // Se registrar na escala
    'desregistrar': unregisterInSchedule, // Se desregistrar na escala
    'deletar': deleteSchedule, // Deletar uma escala
    'cadastrar': setTasksInSchedule, // Cadastrar funções na escala
    'estado': modifyStateSchedule, // 
    'data': setScheduleDate,
    'nome': setScheduleName,
    'alterar': updateTaskInSchedule,
    'adicionar': addTaskToSchedule,
    // 'remover': removeTaskFromSchedule,
};

const emojiTexts: any = {
    'live': '💻 live',
    'som': '🔊 som',
    'corte': '✂️ corte',
    'cameraman': '📹 cameraman',
    'fotos': '📸 fotos',
    'storymaker': '📱 storymaker',
    'videomaker': '🎥 videomaker',
    'avisos': '📢 avisos',
    'entrevista': '🎤 entrevista',
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
            return await msg.reply('Nenhuma opção encontrada.\nEscolha uma opção: <criar | cadastrar | data | nome | listar | registrar | desregistrar | estado | deletar>')
        }
    } catch (error) {
        throw error;
    }
}

async function createSchedule(msg: Message) {
    const id = msg.body.replace('escala criar ', '');

    if (!id || !(id.length > 0)) throw new MissingParameterError();

    const existingSchedule = await Schedule.findOne({ id });
    if (existingSchedule) return await msg.reply(`Já existe uma escala com este identificador.\nUse _${prefix}escala listar ${id}_ para visualizar.`);

    const tasks: role[] = [];

    const schedule = new Schedule({ id, tasks, registered: [] });

    schedule.save();

    return await msg.react('✅');

}

async function setTasksInSchedule(msg: Message) {
    msg.body = msg.body.replace('escala cadastrar', '')
    const id = msg.body.split(' ')[1];

    try {
        const schedule = await getSchedule(id);

        if (schedule.tasks.length > 0) throw new Error(`Já existem funções cadastradas nesta escala.\nUse _${prefix}escala listar ${id}_ para visualizar.`);

        const tasksString = msg.body.split(' ')[2].toLowerCase();
        if (!tasksString) return await msg.reply('Formato de tarefa inválido.');

        const scheduleParts = tasksString.split('//');
        let tasks: role[] = [];

        for (const part of scheduleParts) {
            const [task, quantityStr] = part.split(':');
            const quantity = parseInt(quantityStr);

            if (isNaN(quantity) || quantity <= 0) throw new Error(`Quantidade inválida para a tarefa: _${task}_.`);

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

        await db.schedules.updateOne({ id }, { tasks: schedule.tasks });
        await msg.react('✅');
    }
    catch (error) {
        throw error;
    }
}

async function showSchedule(msg: Message) {
    try {
        const id = msg.body.replace('escala listar', '').trim();
        if (!id) return await showAllSchedules(msg);

        const existingSchedule = await getSchedule(id);

        const schedule: role[] = existingSchedule.tasks;
        let message = `*📃 Escala* _${id}_ - ${existingSchedule.date || ''} \n ${existingSchedule.name || ''} \n`;

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
        return await msg.react('✅');

    } catch (error) {
        throw error;
    }
}

async function registerInSchedule(msg: Message) {
    try {
        msg.body = msg.body.replace('escala registrar ', '')

        const id = msg.body.split(' ')[0];
        msg.body = msg.body.replace(id + ' ', '');

        let respNumber: string = msg.from.replace('@c.us', '');

        if (msg.author) respNumber = msg.author.replace('@c.us', '');

        const task = msg.body.toLowerCase();
        const existingSchedule = await getSchedule(id);

        // Validações
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

        return await msg.react('✅');

    } catch (error) {
        throw error;
    }
}

async function unregisterInSchedule(msg: Message) {

    const id = msg.body.replace('escala desregistrar ', '');

    if (!id) throw new MissingParameterError();

    let respNumber: string = msg.from.replace('@c.us', '');

    if (msg.author) respNumber = msg.author.replace('@c.us', '');

    try {
        const existingSchedule = await getSchedule(id);
        if (!existingSchedule.registered.includes(respNumber)) return await msg.reply('Você não está registrado na escala.');

        existingSchedule.tasks.map((item) => {
            if (item.numero === respNumber) {
                item.resp = null;
                item.numero = null;
                existingSchedule.registered.splice(existingSchedule.registered.indexOf(respNumber), 1);
            }
        });
        await db.schedules.updateOne({ id }, { tasks: existingSchedule.tasks, registered: existingSchedule.registered });

        return await msg.react('✅');
    } catch (error) {
        throw error;
    }
}

async function deleteSchedule(msg: Message) {
    const secret = process.env.SCHEDULE_SECRET;

    msg.body = msg.body.replace('escala deletar', '');
    const id = msg.body.split(' ')[1];
    const secretMSG = msg.body.split(' ')[2];

    if (!id || !secretMSG || !secret) throw new MissingParameterError();
    if (secretMSG != secret) throw new InsufficientPermissionError();

    const isValid = await db.schedules.isValidAndOpen(id);
    if (!isValid) throw new Error(`Não há nenhuma escala aberta com este id.\nUse _${prefix}escala criar_ para criar uma nova escala.`);
    await Schedule.deleteOne({ id });

    return await msg.react('✅');
}

async function showAllSchedules(msg: Message) {
    const schedules: scheduleSchema[] = await db.schedules.find({ isOpen: true });
    if (!schedules.length) {
        await msg.react('❌');
        return await msg.reply('Não há nenhuma escala aberta.');
    }

    const formatedMensage = schedules.map((item) => `- *${item.id}* : ${item.name?.trim() || ''} - ${item.date || ''}`).join('\n');

    await msg.reply(`📌 _ESCALAS ABERTAS_ \n\n${formatedMensage}`);
    return await msg.react('✅');
}

async function modifyStateSchedule(msg: Message) {
    const secret = process.env.SCHEDULE_SECRET;

    msg.body = msg.body.replace('escala estado', '');
    const id = msg.body.split(' ')[1];
    const secretMSG = msg.body.split(' ')[2];

    if (!id || !secretMSG || !secret) throw new MissingParameterError();
    if (secretMSG != secret) throw new InsufficientPermissionError();

    const existingSchedule = await getSchedule(id);
    existingSchedule.isOpen = !existingSchedule.isOpen;

    const statusMessage = existingSchedule.isOpen
        ? 'Escala aberta com sucesso.'
        : 'Escala fechada com sucesso.';

    await Schedule.updateOne({ id }, { isOpen: existingSchedule.isOpen });

    return await msg.react('✅');
}

async function setScheduleDate(msg: Message) {
    const secret = process.env.SCHEDULE_SECRET;

    msg.body = msg.body.replace('escala data', '');
    const id = msg.body.split(' ')[1];
    msg.body = msg.body.replace(id, '');
    const secretMSG = msg.body.split(' ')[2];
    msg.body = msg.body.replace(secretMSG, '')
    const date = msg.body.split(' ')[3];

    try {
        if (!date || !secretMSG || !secret) throw new MissingParameterError();
        if (secretMSG != secret) throw new InsufficientPermissionError();

        const isValid = await db.schedules.isValidAndOpen(id);
        if (!isValid) throw new Error(`Não há nenhuma escala aberta com este id.\nUse _${prefix}escala criar_ para criar uma nova escala.`);
        await db.schedules.updateOne({ id, isOpen: true }, { date });

        return await msg.react('✅');
    } catch (error) {
        throw new Error(`Não foi possível atualizar a data da escala.\nVerifique se a escala está aberta e se o id está correto.`);
    }
}

async function setScheduleName(msg: Message) {
    const secret = process.env.SCHEDULE_SECRET;

    msg.body = msg.body.replace('escala nome', '');
    const id = msg.body.split(' ')[1];
    msg.body = msg.body.replace(id, '');
    const secretMSG = msg.body.split(' ')[2];
    msg.body = msg.body.replace(secretMSG, '')
    const name = msg.body;

    try {
        if (!name || !secretMSG || !secret) throw new MissingParameterError();
        if (secretMSG != secret) throw new InsufficientPermissionError();

        const isValid = await db.schedules.isValidAndOpen(id);
        if (!isValid) throw new Error(`Não há nenhuma escala aberta com este id.\nUse _${prefix}escala criar_ para criar uma nova escala.`);
        await db.schedules.updateOne({ id, isOpen: true }, { name });

        return await msg.react('✅');
    } catch (error) {
        throw new Error(`Não foi possível atualizar o nome da escala.\nVerifique se a escala está aberta e se o id está correto.`);
    }
}

async function getSchedule(id: string) {
    const existingSchedule = await db.schedules.get(id);
    if (!existingSchedule) throw new Error(`Não há nenhuma escala aberta com este id.\nUse _${prefix}escala criar_ para criar uma nova escala.`);
    return existingSchedule as scheduleSchema;
}

async function updateTaskInSchedule(msg: Message) {
    const secret = process.env.SCHEDULE_SECRET;

    msg.body = msg.body.replace('escala alterar', '').trim();
    const [id, oldTask, newTask, secretMSG] = msg.body.split(' ');

    if (!id || !oldTask || !newTask || !secretMSG || !secret) throw new MissingParameterError();
    if (secretMSG !== secret) throw new InsufficientPermissionError();

    try {
        const existingSchedule = await getSchedule(id);

        const taskExists = existingSchedule.tasks.some(task => task.nome.startsWith(oldTask));
        if (!taskExists) {
            await msg.react('❌');
            return await msg.reply(`A função "${oldTask}" não foi encontrada na escala.`);
        }

        existingSchedule.tasks = existingSchedule.tasks.map(task => {
            if (task.nome.startsWith(oldTask)) {
                const taskNumber = task.nome.split(' ')[1];
                task.nome = `${newTask} ${taskNumber}`;
            }
            return task;
        });

        await db.schedules.updateOne({ id }, { tasks: existingSchedule.tasks });

        await msg.react('✅');
    } catch (error) {
        throw new Error('Não foi possível atualizar a função na escala.');
    }
}

async function addTaskToSchedule(msg: Message) {
    const secret = process.env.SCHEDULE_SECRET;

    msg.body = msg.body.replace('escala adicionar', '').trim();
    const [id, secretMSG, taskName, quantityStr] = msg.body.split(' ');

    if (!id || !taskName || !quantityStr || !secretMSG || !secret) throw new MissingParameterError();
    if (secretMSG !== secret) throw new InsufficientPermissionError();

    const quantity = parseInt(quantityStr);
    if (isNaN(quantity) || quantity <= 0) throw new Error('Quantidade inválida para a tarefa.');

    try {
        const existingSchedule = await getSchedule(id);

        const newTasks: role[] = [];
        const existingTaskCount = existingSchedule.tasks.filter(task => task.nome.startsWith(taskName)).length;

        for (let i = 1; i <= quantity; i++) {
            newTasks.push({
                nome: `${taskName} ${existingTaskCount + i}`,
                resp: null,
                numero: null,
            });
        }

        existingSchedule.tasks.push(...newTasks);

        await db.schedules.updateOne({ id }, { tasks: existingSchedule.tasks });

        await msg.react('✅');
        return await msg.reply(`A função "${taskName}" foi adicionada com sucesso (${quantity} novas tarefas).`);
    } catch (error) {
        throw new Error('Não foi possível adicionar a função à escala.');
    }
}

// async function removeTaskFromSchedule(msg: Message) {
//     const secret = process.env.SCHEDULE_SECRET;

//     msg.body = msg.body.replace('escala remover', '').trim();
//     const [id, secretMSG, taskName] = msg.body.split(' ');

//     if (!id || !taskName || !secretMSG || !secret) throw new MissingParameterError();
//     if (secretMSG !== secret) throw new InsufficientPermissionError();

//     try {
//         // Obter a escala existente
//         const existingSchedule = await getSchedule(id);

//         // Verificar se a função existe
//         const taskIndex = existingSchedule.tasks.findIndex(task => task.nome == taskName.trim());
//         if (taskIndex === -1) {
//             await msg.react('❌');
//             return await msg.reply(`A função "${taskName}" não foi encontrada na escala.`);
//         }

//         existingSchedule.tasks.splice(taskIndex, 1);

//         // Salvar as alterações no banco de dados
//         await db.schedules.updateOne({ id }, { tasks: existingSchedule.tasks });

//         await msg.react('✅');
//         return await msg.reply(`A função "${taskName}" foi removida com sucesso.`);
//     } catch (error) {
//         throw new Error('Não foi possível remover a função da escala.');
//     }
// }