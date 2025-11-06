import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import Service from "@/models/Service";
import { getUserFromToken } from "@/utils/getUserToken";

export async function GET(request: Request) {
  try {
    await connectDB();
    const providerId = await getUserFromToken(request);

    if (!providerId) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    const myServices = await Service.find({ providerId: providerId });

    return NextResponse.json(myServices, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao buscar meus serviços:", error);
    return NextResponse.json({ error: "Erro interno ao buscar serviços." }, { status: 500 });
  }
}