import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/utils/mongodb";
import Service from "@/models/Service";
import { getUserFromToken } from "@/utils/getUserToken";
import mongoose from "mongoose";

interface IRating {
  userId: mongoose.Types.ObjectId | string;
  rating: number;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log(`[API RATE] ROTA ACESSADA! Contexto recebido.`);

  try {
    const params = await context.params;
    const rawServiceId = params.id;
    //console.log(`[API RATE] ID bruto extraído dos params: ${rawServiceId}`);

    await connectDB();
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    const serviceId = rawServiceId ? rawServiceId.trim() : '';
    const { rating } = await request.json();

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      console.error("[API RATE] Erro: Rating inválido recebido:", rating);
      return NextResponse.json({ error: "Avaliação inválida. Use um número entre 1 e 5." }, { status: 400 });
    }

    //console.log("[API RATE] Validando serviceId (após trim):", `"${serviceId}"`); // Log simplificado
    if (serviceId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(serviceId) || !mongoose.Types.ObjectId.isValid(serviceId)) {
        console.error("[API RATE] Validação do ObjectId FALHOU para:", `"${serviceId}"`);
        return NextResponse.json({ error: "ID do serviço inválido ou mal formatado." }, { status: 400 });
    }
    console.log("[API RATE] Validação do serviceId OK.");

    const service = await Service.findById(serviceId);
    if (!service) {
      console.warn("[API RATE] Serviço não encontrado com ID:", serviceId);
      return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
    }
    console.log("[API RATE] Serviço encontrado:", service.title);

    const existingRatingIndex = service.ratings.findIndex(
      (r: IRating) => r.userId.toString() === userId
    );

    if (existingRatingIndex > -1) {
      console.log("[API RATE] Usuário já avaliou. Atualizando nota.");
      service.ratings[existingRatingIndex].rating = rating;
    } else {
      console.log("[API RATE] Nova avaliação. Adicionando.");
      service.ratings.push({ userId, rating });
    }

    service.ratingsCount = service.ratings.length;
    if (service.ratingsCount > 0) {
      
      const totalRating = service.ratings.reduce(
        (sum: number, r: IRating) => sum + r.rating, 0
      );
      service.averageRating = totalRating / service.ratingsCount;
    } else {
      service.averageRating = 0;
    }
    //console.log(`[API RATE] Nova Média: ${service.averageRating}, Contagem: ${service.ratingsCount}`);

    await service.save();
    console.log("[API RATE] Avaliação salva com sucesso.");

    return NextResponse.json(
        { averageRating: service.averageRating, ratingsCount: service.ratingsCount },
        { status: 200 }
    );

  
  } catch (error: unknown) {
    console.error("[API RATE] Erro GERAL no try...catch:", error);

    
    if (typeof error === 'object' && error !== null) {
      
      if ((error as any).code === 11000) {
          return NextResponse.json({ error: "Conflito ao salvar avaliação." }, { status: 409 });
      }
      
      if (error instanceof SyntaxError && (error as any).message.includes('JSON')) {
           return NextResponse.json({ error: " Corpo da requisição inválido (não é JSON)." }, { status: 400 });
      }
      
      if ((error as any).name) {
          return NextResponse.json({ error: (error as any).name, message: (error as any).message }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: "Erro interno ao registrar avaliação." }, { status: 500 });
  }
}