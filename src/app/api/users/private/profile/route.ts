import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import User from "@/models/User";
import Service from "@/models/Service";
import { getUserFromToken } from "@/utils/getUserToken";

export async function GET(request: Request) {
  try {
    await connectDB();
    const userId = await getUserFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ error: "Erro interno ao buscar perfil." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const userId = await getUserFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    const newData = await request.json();

    delete newData.password;

    if (newData.email) {
      
      const currentUser = await User.findById(userId);

      if (currentUser && currentUser.email !== newData.email) {
        const existingUserWithEmail = await User.findOne({ 
          email: newData.email, 
          _id: { $ne: userId } 
        });

        if (existingUserWithEmail) {
          return NextResponse.json(
            { error: "Este e-mail já está em uso por outra conta." },
            { status: 409 } 
          );
        }
      } else if (!currentUser) {
         
         return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
      }
    }
   
    const updatedUser = await User.findByIdAndUpdate(userId, newData, { 
        new: true,
        runValidators: true 
    }).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: "Usuário não encontrado para atualização." }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: unknown) { 
    console.error("Erro ao atualizar perfil:", error);

    if (typeof error === 'object' && error !== null) {
      
      if ((error as any).name === 'ValidationError') {
        return NextResponse.json({ error: "Dados inválidos.", details: (error as any).errors }, { status: 400 });
      }
      
      if ((error as any).code === 11000) {
          return NextResponse.json({ error: "O e-mail ou telefone informado já está em uso." }, { status: 409 });
      }
    }
    
    return NextResponse.json({ error: "Erro interno ao atualizar perfil." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const userId = await getUserFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    await Service.deleteMany({ providerId: userId });

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ error: "Usuário não encontrado para deletar." }, { status: 404 });
    }

    return NextResponse.json({ message: "Conta e todos os anúncios associados foram deletados com sucesso." }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    return NextResponse.json({ error: "Erro interno ao deletar a conta." }, { status: 500 });
  }
}