import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import Service from "@/models/Service";

export async function GET(
  request: Request,
 context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: serviceId } = await context.params;

    console.log("Buscando detalhes para o ID:", serviceId);

    const service = await Service.findById(serviceId)
      .populate('providerId', 'name phone -_id'); 

    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
    }

    return NextResponse.json(service, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar detalhe do serviço:", error);
    return NextResponse.json({ error: "Erro ao buscar serviço." }, { status: 500 });
  }
}