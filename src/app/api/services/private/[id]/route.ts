import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import Service from "@/models/Service";
import { getUserFromToken } from "@/utils/getUserToken";

export const PUT = async (
  request: Request,
   context: { params: Promise<{ id: string }> } 
) => {
  try {
    const { id } = await context.params;
    await connectDB();
    const providerId = await getUserFromToken(request);

    if (!providerId) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const newData = await request.json();
    const updatedService = await Service.findOneAndUpdate(
      { _id: id, providerId: providerId },
      newData,
      { 
        new: true,
        //runValidators: true
      } 
    );

    if (!updatedService) {
      return NextResponse.json(
        { error: "Serviço não encontrado ou você não tem permissão para editá-lo." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedService, { status: 200 });
    
  } catch (error: unknown) {
 
    console.error("Erro ao atualizar serviço:", error);
    if ((error as any).kind === 'ObjectId') {
        return NextResponse.json({ error: "ID do serviço inválido." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro interno ao atualizar o serviço." },
      { status: 500 }
    );
  }
}

export const DELETE = async (
  request: Request,
   context: { params: Promise<{ id: string }> } 
) => {
  try {
    const { id } = await context.params;

    await connectDB();

    const providerId = await getUserFromToken(request);

    if (!providerId) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }


    const deletedService = await Service.findOneAndDelete({
      _id: id,
      providerId: providerId,
    });

    if (!deletedService) {
      return NextResponse.json(
        { error: "Serviço não encontrado ou você não tem permissão para deletá-lo." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Serviço deletado com sucesso." }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erro ao deletar serviço:", error);
    
    let errorMessage = "Erro interno ao deletar o serviço.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }

    return NextResponse.json({ error: "Erro interno ao deletar o serviço." }, { status: 500 });
  }
}