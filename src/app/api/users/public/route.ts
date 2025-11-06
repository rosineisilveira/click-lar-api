import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find();

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}