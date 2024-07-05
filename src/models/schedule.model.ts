import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    nome: { type: String },
    resp: { type: String },
    numero: { type: String }
});

const scheduleSchema = new mongoose.Schema({
    id: { type: String, required: true },
    isOpen: { type: Boolean, required: true, default: true },
    tasks: [taskSchema],
    registered: { type: [String], required: true }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;