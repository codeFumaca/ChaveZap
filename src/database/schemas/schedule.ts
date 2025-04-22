import { Schema } from "mongoose";

export const scheduleSchema = new Schema(
    {
        id: { type: String, required: true },
        name: { type: String, required: false },
        date: { type: String, required: false },
        tasks: [],
        registered: [],
        isOpen: { type: Boolean, default: false },
    },
    {
        statics: {
            async get(id: string) {
                return await this.findOne({ id });
            },
            async isValidAndOpen(id: string): Promise<boolean> {
                return await this.findOne({ id, isOpen: true }) ? true : false;
            }
        }
    }
);