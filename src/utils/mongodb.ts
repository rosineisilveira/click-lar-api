import mongoose from "mongoose";
import '@/models/User';
import '@/models/Service';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Defina a variável MONGODB_URI no arquivo .env");
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log(" MongoDB conectado");
  } catch (error) {
    console.error(" Erro ao conectar no MongoDB:", error);
  }
}
