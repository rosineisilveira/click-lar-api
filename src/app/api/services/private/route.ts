import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import Service from "@/models/Service";
import { getUserFromToken } from "@/utils/getUserToken";
import { CATEGORIES } from "@/utils/categories"; 

export async function POST(req: Request) {
  try {
    await connectDB();
    const providerId = await getUserFromToken(req);

    if (!providerId) {
      return NextResponse.json(
        { error: "Usuário não autenticado ou token inválido." },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.category || !CATEGORIES.includes(body.category)) {
      return NextResponse.json(
        { 
          error: "Categoria inválida.",
          message: `A categoria deve ser uma das seguintes: ${CATEGORIES.join(', ')}`
        },
        { status: 400 } 
      );
    }

    const serviceData = {
      ...body,
      providerId: providerId,
    };

    const newService = await Service.create(serviceData);
    return NextResponse.json(newService, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar serviço:", error);

   if (typeof error === 'object' && error !== null) {
    
      if ((error as any).name === "ValidationError") {
        return NextResponse.json(
          { 
            error: "Dados inválidos.", 
            
            details: (error as any).errors 
          }, 
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: "Erro interno ao criar o serviço." },
      { status: 500 }
    );
  }
}

