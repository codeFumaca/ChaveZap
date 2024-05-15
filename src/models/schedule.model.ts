import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    nome: String,
    resp: String,
    numero: String
});

const scheduleSchema = new mongoose.Schema({
    week: Number,
    year: Number,
    tasks: [taskSchema],
    registered: [String]
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;