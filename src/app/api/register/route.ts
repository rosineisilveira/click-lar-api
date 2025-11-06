import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, phone, password } = await req.json();

    if (!name ||!email ||!phone || !password) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está em uso." },
        { status: 409 } 
      );
    }

    const newUser = new User({ name, email, phone,  password });
    const savedUser = await newUser.save();
    
    const userResponse = {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
    };

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error: any) {
    
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar usuário." },
      { status: 500 }
    );
  }
}
