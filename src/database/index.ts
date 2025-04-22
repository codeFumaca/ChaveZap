import mongoose, { InferSchemaType, model } from "mongoose";
import { scheduleSchema } from "./schemas/schedule.ts";

export const connectar = async () => {
    console.log("Conectando ao MongoDB...");
    const URI = process.env.MONGODB_URI;

    if (!URI) throw new Error("A URI do MongoDB não foi fornecida.");

    try {
        await mongoose.connect(URI)
            .then(() => {
                console.log("Conectado com sucesso!");
            })
    }
    catch (err) {
        throw err;
    }
}

export const db = {
    schedules: model("schedule", scheduleSchema, "schedules"),
}

export type scheduleSchema = InferSchemaType<typeof scheduleSchema>;