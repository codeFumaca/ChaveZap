import mongoose from "mongoose";

export const connectar = async () => {
    console.log("Conectando ao MongoDB...");
    const URI = "mongodb+srv://admin:admin@cluster0.gn4ct4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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