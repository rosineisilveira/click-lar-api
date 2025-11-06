import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import User from "@/models/User";
import { getUserFromToken } from "@/utils/getUserToken";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    await connectDB();
    const userId = await getUserFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "A senha atual e a nova senha são obrigatórias." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "A senha atual está incorreta." }, { status: 403 }); 
    }
    
    user.password = newPassword;
    await user.save();

    return NextResponse.json({ message: "Senha atualizada com sucesso." }, { status: 200 });

  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar a senha." }, { status: 500 });
  }
}